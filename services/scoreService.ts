// services/scoreService.ts

type RiskType =
  | 'high-risk'
  | 'off-itinerary'
  | 'inactive'
  | 'panic'
  | 'signal-lost';

type RiskEvent = {
  type: RiskType;
  timestamp: number;
  scoreDelta: number;
};

type AlertLevel = 'green' | 'yellow' | 'red';

const SCORE_RULES: Record<RiskType, number> = {
  'high-risk': 1,
  'off-itinerary': 2,
  'inactive': 0.5,
  'panic': 100,
  'signal-lost': 50,
};

const alertThresholds = {
  yellow: 20,
  red: 80,
};

let currentScore = 0;
let eventLog: RiskEvent[] = [];

export const getScore = () => currentScore;

export const getEventLog = () => [...eventLog];

export const resetScore = () => {
  currentScore = 0;
  eventLog = [];
};

export const addScore = (type: RiskType): number => {
  const delta = SCORE_RULES[type];
  const timestamp = Date.now();

  currentScore += delta;
  eventLog.push({ type, timestamp, scoreDelta: delta });

  return currentScore;
};

export const getAlertLevel = (): AlertLevel => {
  if (currentScore > alertThresholds.red) return 'red';
  if (currentScore > alertThresholds.yellow) return 'yellow';
  return 'green';
};

// Optional: decay score over time
export const decayScore = (rate: number = 1): void => {
  // Reduce score gradually (e.g., every minute)
  if (currentScore > 0) {
    currentScore = Math.max(0, currentScore - rate);
  }
};
