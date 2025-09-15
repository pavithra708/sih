let lastLoc: { latitude: number; longitude: number; timestamp: number } | null = null;

const metersBetween = (a: any, b: any) => {
  const R = 6371e3; // Earth radius in meters
  const toRad = (v: number) => (v * Math.PI) / 180;
  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δφ = toRad(b.latitude - a.latitude);
  const Δλ = toRad(b.longitude - a.longitude);

  const u = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(u), Math.sqrt(1 - u));
  return R * c;
};

export const anomalyService = {
  isStationaryTooLong: (loc: any) => {
    if (!lastLoc) {
      lastLoc = { ...loc };
      return false;
    }
    const d = metersBetween(lastLoc, loc);
    const dt = (loc.timestamp - lastLoc.timestamp) / 1000; // seconds
    const stationary = d < 5 && dt > 90; // stationary > 90s within 5m
    if (dt > 30) lastLoc = { ...loc }; // periodic update
    return stationary;
  },
  detectJump: (loc: any) => {
    if (!lastLoc) {
      lastLoc = { ...loc };
      return false;
    }
    const d = metersBetween(lastLoc, loc);
    const dt = (loc.timestamp - lastLoc.timestamp) / 1000;
    if (dt <= 0) return false;
    const speed = d / dt; // m/s
    const isJump = speed > 30; // unrealistic speed -> jump
    if (dt > 30) lastLoc = { ...loc };
    return isJump;
  },
  reset: () => { lastLoc = null; }, // optional: reset state
};
