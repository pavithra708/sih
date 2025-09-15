// contexts/LocationContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as ExpoLocation from "expo-location";
import { apiService } from "../services/apiService";
import { addScore } from "../services/scoreService";
import { useInactivityTracker } from "../hooks/useInactivityTracker";
import { isOffItinerary } from "../utils/itineraryUtils";
import { useAuth } from "./AuthContext";
import { geofenceService } from "../services/geofenceService";

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationContextType {
  currentLocation: Location | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  sendPanicAlert: () => Promise<void>;
  safetyScore: number;
  updateSafetyScore: (score: number) => void;
  isOffline: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tourist } = useAuth() as any;
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isTracking, setIsTracking] = useState(false);
  const [safetyScore, setSafetyScore] = useState(80);
  const [isOffline, setIsOffline] = useState(false);

  const watchRef = useRef<ExpoLocation.LocationSubscription | null>(null);

  const plannedRoute = [
    { latitude: 12.9716, longitude: 77.5946 },
    { latitude: 12.9725, longitude: 77.596 },
    { latitude: 12.9735, longitude: 77.597 },
  ];

  useInactivityTracker(currentLocation);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (watchRef.current?.remove) watchRef.current.remove();
      watchRef.current = null;
    };
  }, []);

  useEffect(() => {
    const offCheck = setInterval(() => {
      if (Date.now() - lastUpdateTime > 2 * 60 * 1000) setIsOffline(true);
      else setIsOffline(false);
    }, 30 * 1000);
    return () => clearInterval(offCheck);
  }, [lastUpdateTime]);

  const requestPermissions = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        await getCurrentLocation();
      } else {
        console.warn("Location permission not granted");
      }
    } catch (err) {
      console.error("requestPermissions error:", err);
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    try {
      const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
      const newLoc: Location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, timestamp: Date.now() };
      setCurrentLocation(newLoc);
      setLastUpdateTime(Date.now());
      return newLoc;
    } catch (err) {
      console.error("Error getting current location:", err);
      return null;
    }
  };

  const startTracking = async () => {
    if (isTracking) return;
    setIsTracking(true);
    try {
      const subscription = await ExpoLocation.watchPositionAsync(
        { accuracy: ExpoLocation.Accuracy.High, timeInterval: 30 * 1000, distanceInterval: 10 },
        (location) => {
          const newLocation: Location = { latitude: location.coords.latitude, longitude: location.coords.longitude, timestamp: Date.now() };
          setCurrentLocation(newLocation);
          setLastUpdateTime(Date.now());

          if (apiService.updateLocation) {
            apiService.updateLocation(tourist?.id ?? null, newLocation).catch((err: any) => console.warn("updateLocation failed:", err));
          }
        }
      );
      watchRef.current = subscription;
    } catch (err) {
      console.error("startTracking watchPositionAsync error:", err);
      setIsTracking(false);
    }
  };

  const stopTracking = async () => {
    setIsTracking(false);
    try {
      if (watchRef.current?.remove) watchRef.current.remove();
      watchRef.current = null;
    } catch (err) {
      console.warn("stopTracking cleanup error:", err);
    }
  };

  const sendPanicAlert = async () => {
    const location = await getCurrentLocation();
    if (!location) return;
    const alert = { type: "panic", location, message: "Emergency panic button pressed", timestamp: Date.now() };
    try {
      if (apiService.sendPanicAlert) {
        await apiService.sendPanicAlert(tourist?.id ?? null, alert);
      }
      if (!isTracking) await startTracking();
      addScore("panic" as any);
    } catch (err) {
      console.error("Failed to send panic alert:", err);
    }
  };

  const updateSafetyScore = (score: number) => setSafetyScore(Math.max(0, Math.min(100, score)));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - lastUpdateTime) / 1000;
      if (timeDiff > 60 && currentLocation) {
        const zone = geofenceService.checkLocation(currentLocation as any);
        if (zone?.riskLevel === "high") {
          console.warn("[ALERT] Signal lost in high-risk area");
          addScore("signal-lost" as any);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastUpdateTime, currentLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLocation && plannedRoute.length > 0) {
        const offRoute = isOffItinerary(currentLocation as any, plannedRoute, 100);
        if (offRoute) {
          console.warn("[ALERT] Off-Itinerary Detected");
          addScore("off-itinerary" as any);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentLocation]);

  return (
    <LocationContext.Provider value={{ currentLocation, isTracking, startTracking, stopTracking, sendPanicAlert, safetyScore, updateSafetyScore, isOffline }}>
      {children}
    </LocationContext.Provider>
  );
};
