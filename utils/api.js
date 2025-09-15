import { saveOfflineData, loadOfflineData } from './storage';
import { useAuth } from '../contexts/AuthContext';

// Fetch places dynamically based on city
export async function fetchPlaces(city) {
  try {
    const res = await fetch(`http://localhost:5000/api/places?q=${encodeURIComponent(city)}`);
    const data = await res.json();
    await saveOfflineData(`places_${city}.json`, data); // cache per city
    return data;
  } catch (err) {
    return (await loadOfflineData(`places_${city}.json`)) || [];
  }
}

// Fetch roads dynamically based on city
export async function fetchRoads(city) {
  try {
    const res = await fetch(`http://localhost:5000/api/roads?q=${encodeURIComponent(city)}`);
    const data = await res.json();
    await saveOfflineData(`roads_${city}.json`, data); // cache per city
    return data;
  } catch (err) {
    return (await loadOfflineData(`roads_${city}.json`)) || { elements: [] };
  }
}
