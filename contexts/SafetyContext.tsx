import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { geofenceService } from "../services/geofenceService";
import { anomalyService } from "../services/anomalyService";
import { addScore, getScore, resetScore } from "../services/scoreService";
import { saveOfflineData } from "../utils/storage";
import { useLocation } from "./LocationContext";
import { sendSOS } from "../utils/sendSOS";

type SafetyContextType = {
  worryScore: number;
  showPrompt: boolean;
  setShowPrompt: (v: boolean) => void;
  handlePromptYes: () => void;
  handlePromptNo: (autoTimeout?: boolean) => Promise<void>;
  triggerManualSOS: () => void;
  acknowledgeSafe: () => void;
};

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLocation, isOffline, destination, userId } = useLocation();
  const [worryScore, setWorryScore] = useState<number>(getScore() ?? 0);
  const [showPrompt, setShowPrompt] = useState(false);
  const ignoreUntilRef = useRef<number>(0); // timestamp to ignore for 10 min
  const isHandlingEmergency = useRef(false);

  // Main risk monitoring
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentLocation) return;

      const now = Date.now();
      if (now < ignoreUntilRef.current) return; // ignore active

      let increment = 0;
      const zone = geofenceService.checkLocation(currentLocation);

      if (zone?.riskLevel === "high") increment += 2;
      else if (zone?.riskLevel === "medium") increment += 1;

      if (anomalyService.isStationaryTooLong(currentLocation)) increment += 0.5;

      if (destination) {
        const dist = metersBetween(currentLocation, destination);
        if (dist > 20) increment += 1;
      }

      if (increment > 0) await addScore(increment as any);
      const score = getScore();
      setWorryScore(score);

      // Show prompt for medium/high or score>=80
      if ((zone?.riskLevel === "medium" || zone?.riskLevel === "high") || score >= 80) {
        setShowPrompt(true);

        // Auto SOS for red/high zones or score>=80
        if ((zone?.riskLevel === "high" || score >= 80) && !isHandlingEmergency.current) {
          isHandlingEmergency.current = true;
          setTimeout(async () => {
            await triggerEmergencyFlow("High risk / red zone timeout");
            isHandlingEmergency.current = false;
          }, 10000);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentLocation, destination, isOffline, userId]);

  const acknowledgeSafe = async () => {
    await resetScore();
    setWorryScore(0);
    setShowPrompt(false);
  };

  const handlePromptYes = async () => acknowledgeSafe();

  const handlePromptNo = async (autoTimeout = false) => {
    setShowPrompt(false);
    await triggerEmergencyFlow(autoTimeout ? "timeout" : "user_no");
  };

  const triggerManualSOS = () => setShowPrompt(true);

  const triggerEmergencyFlow = async (reason: string) => {
    try {
      const alertEvent = {
        ts: Date.now(),
        reason,
        worryScore: getScore(),
        location: currentLocation,
      };

      if (isOffline) {
        await saveOfflineData(`offline_alert_${alertEvent.ts}.json`, alertEvent);
      } else {
        await sendSOS(userId, `Emergency triggered: ${reason}`);
      }
    } catch (err) {
      console.error("triggerEmergencyFlow error:", err);
      await saveOfflineData(`offline_alert_${Date.now()}.json`, {
        ts: Date.now(),
        reason,
        location: currentLocation,
      });
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        worryScore,
        showPrompt,
        setShowPrompt,
        handlePromptYes,
        handlePromptNo,
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
