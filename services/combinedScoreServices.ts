import { anomalyService } from './anomalyService';
import { addScore, getScore as getWorryScore, getAlertLevel } from './scoreService';
import crimeData from '../backend/data/stateCities.json';
import placesData from '../backend/data/places.json';
import roadsData from '../backend/data/roads.json';

export const computeCombinedScore = (location: { latitude: number; longitude: number; timestamp?: number }, city: string) => {
  let baseScore = getWorryScore();

  // -----------------------------
  // 1️⃣ Anomaly detection
  const anomalies = anomalyService.checkForAnomalies(location, []); // Add plannedItinerary if available
  anomalies.forEach(anomaly => {
    switch (anomaly.message) {
      case 'Tourist has been stationary for an extended period':
        addScore('inactive');
        break;
      case 'Sudden significant change in location detected':
        addScore('signal-lost');
        break;
      case 'Tourist has deviated significantly from planned itinerary':
        addScore('off-itinerary');
        break;
    }
  });

  // -----------------------------
  // 2️⃣ Data-based scoring
  // Crime score (inverse of incidents)
  const crimeIncidents = crimeData[city]?.incidents || 0;
  const crimeScore = Math.max(0, 100 - crimeIncidents * 0.5); // weight can be adjusted

  // Road score (more roads/higher connectivity → safer)
  const roadCount = roadsData[city]?.elements?.length || 0;
  const roadScore = Math.min(roadCount * 2, 100);

  // Tourist density (crowded → lower safety)
  const touristCount = placesData[city]?.length || 0;
  const touristScore = Math.max(0, 100 - touristCount * 2);

  const dataScore = Math.round((crimeScore * 0.5 + roadScore * 0.3 + touristScore * 0.2));

  // -----------------------------
  // 3️⃣ Combine with anomaly score
  const finalScore = Math.round((baseScore * 0.5 + dataScore * 0.5));

  return {
    score: finalScore,
    alertLevel: finalScore > 80 ? 'green' : finalScore > 60 ? 'yellow' : 'red',
    details: {
      anomalyScore: baseScore,
      crimeScore,
      roadScore,
      touristScore,
    },
  };
};
