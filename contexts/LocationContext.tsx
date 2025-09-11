import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as Location from "expo-location";
import { Location as LocationType, Alert } from "../types";
import { useAuth } from "./AuthContext";
import { apiService } from "../services/apiService";
import { geofenceService } from "../services/geofenceService";
import { addScore } from "../services/scoreService";
import { useInactivityTracker } from "../hooks/useInactivityTracker";
import { isOffItinerary } from "../utils/itineraryUtils";

interface LocationContextType {
  currentLocation: LocationType | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  sendPanicAlert: () => Promise<void>;
  safetyScore: number;
  updateSafetyScore: (score: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(false);
  const [safetyScore, setSafetyScore] = useState(80);
  const { tourist, updateTourist } = useAuth();

  const plannedRoute = [
    { latitude: 12.9716, longitude: 77.5946 },
    { latitude: 12.9725, longitude: 77.596 },
    { latitude: 12.9735, longitude: 77.597 },
  ];

  // inactivity monitor
  useInactivityTracker(currentLocation);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (tourist?.isTrackingEnabled && !isTracking) {
      startTracking();
    }
  }, [tourist?.isTrackingEnabled]);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };
      setCurrentLocation(newLocation);
      setLastUpdateTime(Date.now());
      return newLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  };

  const startTracking = async () => {
    if (isTracking) return;
    setIsTracking(true);

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5 * 60 * 1000,
        distanceInterval: 100,
      },
      (location) => {
        const newLocation: LocationType = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: Date.now(),
        };
        setCurrentLocation(newLocation);
        setLastUpdateTime(Date.now());

        if (tourist) {
          apiService.updateLocation(tourist.id, newLocation);
        }
      }
    );

    if (tourist) {
      await updateTourist({ isTrackingEnabled: true });
    }
  };

  const stopTracking = async () => {
    setIsTracking(false);
    if (tourist) {
      await updateTourist({ isTrackingEnabled: false });
      await apiService.stopTracking(tourist.id);
    }
  };

  const sendPanicAlert = async () => {
    const location = await getCurrentLocation();
    if (location && tourist) {
      const alert: Alert = {
        type: "panic",
        location,
        message: "Emergency panic button pressed",
        timestamp: Date.now(),
      };
      try {
        await apiService.sendPanicAlert(tourist.id, alert);
        if (!isTracking) {
          await startTracking();
        }
        addScore("panic");
      } catch (error) {
        console.error("Failed to send panic alert:", error);
      }
    }
  };

  const updateSafetyScore = (score: number) => {
    setSafetyScore(Math.max(0, Math.min(100, score)));
  };

  // lost signal in risky area
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - lastUpdateTime) / 1000;
      if (timeDiff > 60 && currentLocation) {
        const zone = geofenceService.checkLocation(currentLocation);
        if (zone?.riskLevel === "high") {
          console.warn("[ALERT] Signal lost in high-risk area");
          addScore("signal-lost");
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastUpdateTime, currentLocation]);

  // off itinerary
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLocation && plannedRoute.length > 0) {
        const offRoute = isOffItinerary(currentLocation, plannedRoute, 100);
        if (offRoute) {
          console.warn("[ALERT] Off-Itinerary Detected");
          addScore("off-itinerary");
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isTracking,
        startTracking,
        stopTracking,
        sendPanicAlert,
        safetyScore,
        updateSafetyScore,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
