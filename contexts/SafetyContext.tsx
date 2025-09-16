// contexts/SafetyContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { geofenceService } from "../services/geofenceService";
import { anomalyService } from "../services/anomalyService";
import { addScore, getScore, resetScore } from "../services/scoreService";
import { useLocation } from "./LocationContext";
import { useAuth } from "./AuthContext";
import { triggerSOS } from "../services/sosService";

type SafetyContextType = {
  worryScore: number;
  showPrompt: boolean;
  sosStatus: string;
  setShowPrompt: (v: boolean) => void;
  handlePromptYes: () => void;
  handlePromptNo: (autoTimeout?: boolean) => Promise<void>;
  handlePromptIgnore: () => void;
  triggerManualSOS: () => void;
  acknowledgeSafe: () => void;
};

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLocation, destination } = useLocation();
  const { tourist } = useAuth();
  const userId = tourist?.id;

  const [worryScore, setWorryScore] = useState<number>(getScore() ?? 0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [sosStatus, setSosStatus] = useState<string>("");
  const ignoreUntilRef = useRef<number>(0);
  const isHandlingEmergency = useRef(false);

  // Get latest GPS location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Location permission denied");

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch (err) {
      console.error("Failed to get location:", err);
      return null;
    }
  };

  // Risk monitoring
  useEffect(() => {
    const interval = setInterval(async () => {
      const loc = currentLocation ?? (await getCurrentLocation());
      if (!loc) return;
      if (Date.now() < ignoreUntilRef.current) return;

      let increment = 0;
      const zone = geofenceService.checkLocation(loc);

      if (zone?.riskLevel === "high") increment += 2;
      else if (zone?.riskLevel === "medium") increment += 1;

      if (anomalyService.isStationaryTooLong(loc)) increment += 0.5;

      if (destination) {
        const dist = metersBetween(loc, destination);
        if (dist > 20) increment += 1;
      }

      if (increment > 0) await addScore(increment as any);
      const score = getScore();
      setWorryScore(score);

      if ((zone?.riskLevel === "medium" || zone?.riskLevel === "high") || score >= 80) {
        setShowPrompt(true);

        // Auto SOS for high risk
        if ((zone?.riskLevel === "high" || score >= 80) && !isHandlingEmergency.current) {
          isHandlingEmergency.current = true;
          setTimeout(async () => {
            await triggerEmergencyFlow("High risk / auto SOS");
            isHandlingEmergency.current = false;
          }, 10000);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentLocation, destination, userId]);

  const acknowledgeSafe = async () => {
    await resetScore();
    setWorryScore(0);
    setShowPrompt(false);
  };

  const handlePromptYes = async () => acknowledgeSafe();

  const handlePromptNo = async (autoTimeout = false) => {
    setSosStatus("Fetching location...");
    await triggerEmergencyFlow(autoTimeout ? "auto timeout" : "user indicated unsafe");
    setShowPrompt(false);
  };

  const handlePromptIgnore = () => {
    ignoreUntilRef.current = Date.now() + 10 * 60 * 1000;
    setShowPrompt(false);
    console.log("⏸️ Ignored until:", new Date(ignoreUntilRef.current).toLocaleTimeString());
  };

  const triggerManualSOS = async () => {
    setShowPrompt(true);
    setSosStatus("Fetching location...");
    await triggerEmergencyFlow("Manual SOS");
  };

  const triggerEmergencyFlow = async (reason: string) => {
    if (!userId) {
      setSosStatus("⚠️ SOS failed: missing user");
      return;
    }

    const loc = currentLocation ?? (await getCurrentLocation());
    if (!loc) {
      setSosStatus("⚠️ SOS failed: location unavailable");
      return;
    }

    setSosStatus("Sending SOS...");
    try {
      await triggerSOS(userId, worryScore, reason, loc);
      setSosStatus("✅ SOS sent successfully!");
      console.log("✅ SOS sent:", reason);
    } catch (err: any) {
      console.error("❌ SOS failed:", err);
      setSosStatus("⚠️ SOS saved offline, will sync later");
    } finally {
      setTimeout(() => setSosStatus(""), 5000);
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        worryScore,
        showPrompt,
        sosStatus,
        setShowPrompt,
        handlePromptYes,
        handlePromptNo,
        handlePromptIgnore,
        triggerManualSOS,
        acknowledgeSafe,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error("useSafety must be used within SafetyProvider");
  return ctx;
};

// Haversine distance
function metersBetween(a: any, b: any) {
  const R = 6371e3;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δφ = toRad(b.latitude - a.latitude);
  const Δλ = toRad(b.longitude - a.longitude);
  const u = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(u), Math.sqrt(1 - u));
  return R * c;
}
