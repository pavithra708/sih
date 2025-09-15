// services/geofenceService.ts
type LatLon = { latitude: number; longitude: number };

const toRad = (v: number) => (v * Math.PI) / 180;

const distanceMeters = (a: LatLon, b: LatLon) => {
  const R = 6371e3;
  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δφ = toRad(b.latitude - a.latitude);
  const Δλ = toRad(b.longitude - a.longitude);

  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);
  const u = sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ;
  const c = 2 * Math.atan2(Math.sqrt(u), Math.sqrt(1 - u));
  return R * c;
};

const zones = [
  { name: "Central Market", center: { latitude: 12.9719, longitude: 77.5937 }, radius: 300, riskLevel: "high" },
  { name: "Old Town", center: { latitude: 12.974, longitude: 77.595 }, radius: 500, riskLevel: "medium" },
];

export const geofenceService = {
  checkLocation: (loc: LatLon | null) => {
    if (!loc) return null;
    for (const z of zones) {
      const d = distanceMeters(loc, z.center);
      if (d <= z.radius) {
        return { name: z.name, riskLevel: z.riskLevel };
      }
    }
    return { name: "Outside", riskLevel: "low" };
  },
};
