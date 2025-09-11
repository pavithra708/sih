import { useEffect, useRef } from 'react';
import { Location as LocationType } from '../types';
import { addScore } from '../services/scoreService';
import haversine from 'haversine-distance';

export const useInactivityTracker = (currentLocation: LocationType | null) => {
  const lastActiveLocationRef = useRef(currentLocation);
  const lastActiveTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const current = currentLocation;
      const last = lastActiveLocationRef.current;

      if (!current || !last) return;

      const distance = haversine(
        { lat: current.latitude, lon: current.longitude },
        { lat: last.latitude, lon: last.longitude }
      );

      // If user hasn't moved more than 10m in 5 minutes
      if (distance < 10) {
        const inactiveTime = (now - lastActiveTimeRef.current) / 1000;
        if (inactiveTime >= 300) {
          console.log('[INACTIVITY] Detected inactivity for 5 mins');
          addScore('inactive');
          lastActiveTimeRef.current = now; // reset timer after scoring
        }
      } else {
        // User moved → reset last active location and time
        lastActiveLocationRef.current = current;
        lastActiveTimeRef.current = now;
      }
    }, 60 * 1000); // check every 1 minute

    return () => clearInterval(interval);
  }, [currentLocation]);
};
