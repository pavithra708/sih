// utils/itineraryUtils.ts

import { getDistance } from 'geolib';

export function isOffItinerary(
  userLocation: { latitude: number; longitude: number },
  route: Array<{ latitude: number; longitude: number }>,
  toleranceMeters = 100
): boolean {
  if (!route.length) return false;

  const distances = route.map((waypoint) =>
    getDistance(userLocation, waypoint)
  );

  const minDistance = Math.min(...distances);
  return minDistance > toleranceMeters;
}
