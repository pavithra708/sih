import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { fetchPlaces, fetchRoads } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function CityFeatures() {
  const { tourist } = useAuth(); // get logged-in user's city
  const [places, setPlaces] = useState([]);
  const [roads, setRoads] = useState([]);

  useEffect(() => {
    // TODO: Replace 'cityName' with the correct property if available on tourist
    const city = (tourist as any)?.city || (tourist as any)?.cityName;
    if (!city) return; // exit if city not available

    (async () => {
      const placesData = await fetchPlaces(city);
      setPlaces(placesData);

      const roadsData = await fetchRoads(city);
      setRoads(roadsData);
    })();
  }, [
    // TODO: Replace 'cityName' with the correct property if available on tourist
    (tourist as any)?.city || (tourist as any)?.cityName
  ]);

  return (
    <View>
      <Text>Places in {(tourist as any)?.city || (tourist as any)?.cityName || 'your city'}:</Text>
      {places.map((p, i) => (
        <Text key={i}>
          {p.name} - {p.zone || 'Unknown zone'}
        </Text>
      ))}

      <Text>Roads data fetched: {roads.elements?.length || 0}</Text>
    </View>
  );
}
