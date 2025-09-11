import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock } from 'lucide-react-native';
import { Location } from '../types';

interface LocationCardProps {
  location: Location | null;
  isTracking: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, isTracking }) => {
  const { t } = useTranslation();

  const formatLocation = (loc: Location) => {
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={20} color="#2196F3" />
        <Text style={styles.title}>{t('home.currentLocation')}</Text>
      </View>
      
      {location ? (
        <View style={styles.locationInfo}>
          <Text style={styles.coordinates}>{formatLocation(location)}</Text>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#666" />
            <Text style={styles.time}>{formatTime(location.timestamp)}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noLocation}>Location not available</Text>
      )}
      
      <View style={[styles.trackingStatus, { backgroundColor: isTracking ? '#4CAF50' : '#FF9800' }]}>
        <Text style={styles.trackingText}>
          {isTracking ? t('home.trackingOn') : t('home.trackingOff')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  locationInfo: {
    marginBottom: 12,
  },
  coordinates: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#555',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  noLocation: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  trackingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  trackingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});