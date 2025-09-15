// services/scoreService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@worry_score";

// in-memory score
let inMemoryScore = 0;

// Police feedback adjustments
let feedbackAdjustments: { [key: string]: number } = {};

// Apply feedback from police
export const applyFeedback = (feedbackList: any[]) => {
  feedbackAdjustments = {};
  feedbackList.forEach((f) => {
    if (!f.isTrueAlert) {
      feedbackAdjustments[f.reason] = -0.5; // reduce score
    } else {
      feedbackAdjustments[f.reason] = 0.5; // increase score
    }
  });
};

// Get adjustment for a given reason
export const getAdjustment = (reason: string) => feedbackAdjustments[reason] || 0;

// Add score with optional event string
export const addScore = async (inc: number | string) => {
  let numeric = 0;

  if (typeof inc === "number") numeric = inc;
  else if (inc === "panic") numeric = 50;
  else if (inc === "signal-lost") numeric = 20;
  else if (inc === "off-itinerary") numeric = 10;
  else numeric = 0;

  inMemoryScore = Math.min(200, Math.max(0, inMemoryScore + numeric));
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(inMemoryScore));
  } catch (e) {
    console.warn("AsyncStorage setItem failed:", e);
  }
};

// Get current score
export const getScore = (): number => inMemoryScore;

// Reset score
export const resetScore = async () => {
  inMemoryScore = 0;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, "0");
  } catch (e) {
    console.warn("AsyncStorage reset failed:", e);
  }
};
