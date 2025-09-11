//index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Shield, MapPin, Activity, AlertTriangle, CheckCircle } from 'lucide-react-native';

// ----- MOCK TOURIST -----
const mockTourist = {
  id: '123',
  name: 'Test User',
  isTrackingEnabled: true,
  emergencyContacts: [
    { name: 'Alice', phone: '+1234567890' },
    { name: 'Bob', phone: '+0987654321' },
  ],
};

// ----- MOCK LOCATION -----
const mockCurrentLocation = {
  latitude: 12.9716,
  longitude: 77.5946,
  timestamp: Date.now(),
};

// ----- MOCK GEOFENCE SERVICE -----
const mockGeofenceService = {
  checkLocation: (location: any) => {
    if (location.latitude === 12.9716) {
      return { name: 'Central Park', riskLevel: 'high' };
    }
    return null;
  },
};

export default function SafetyScreen() {
  const [tourist] = useState(mockTourist);
  const [currentLocation] = useState(mockCurrentLocation);
  const [safetyScore] = useState(75);
  const [refreshing, setRefreshing] = useState(false);
  const [currentZone, setCurrentZone] = useState<any>(null);

  useEffect(() => {
    checkCurrentZone();
  }, [currentLocation]);

  const checkCurrentZone = () => {
    const zone = mockGeofenceService.checkLocation(currentLocation);
    setCurrentZone(zone);
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkCurrentZone();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getZoneStatus = () => {
    if (!currentZone) {
      return {
        icon: CheckCircle,
        color: '#4CAF50',
        title: 'Safe Zone',
        message: 'You are in a safe area',
      };
    }
    return {
      icon: AlertTriangle,
      color: currentZone.riskLevel === 'high' ? '#F44336' : '#FF9800',
      title: 'Danger Zone',
      message: `Exit the zone!\nZone: ${currentZone.name}`,
    };
  };

  const zoneStatus = getZoneStatus();
  const StatusIcon = zoneStatus.icon;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Safety Dashboard</Text>

      {/* Safety Score */}
      <View style={styles.scoreCard}>
        <Shield size={32} color={getScoreColor(safetyScore)} />
        <View style={styles.scoreContent}>
          <Text style={styles.scoreTitle}>Safety Score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(safetyScore) }]}>{safetyScore}/100</Text>
        </View>
      </View>

      {/* Location Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MapPin size={24} color="#2196F3" />
          <Text style={styles.statusTitle}>Geofence</Text>
        </View>
        <View style={styles.zoneStatus}>
          <StatusIcon size={20} color={zoneStatus.color} />
          <Text style={[styles.zoneText, { color: zoneStatus.color }]}>{zoneStatus.title}</Text>
        </View>
        {currentZone && <Text style={styles.zoneMessage}>{zoneStatus.message}</Text>}
      </View>

      {/* Activity Monitoring */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Activity size={24} color="#4CAF50" />
          <Text style={styles.statusTitle}>Activity Monitoring</Text>
        </View>
        <View style={styles.monitoringStatus}>
          <CheckCircle size={20} color="#4CAF50" />
          <Text style={styles.monitoringText}>Monitoring active</Text>
        </View>
        <Text style={styles.monitoringDescription}>
          Movement patterns are monitored for unusual activity
        </Text>
      </View>

      {/* Emergency Contacts */}
      {tourist && tourist.emergencyContacts.length > 0 && (
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          {tourist.emergencyContacts.slice(0, 2).map((contact, index) => (
            <View key={index} style={styles.emergencyContact}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreContent: { flex: 1, marginLeft: 16 },
  scoreTitle: { fontSize: 16, color: '#333', marginBottom: 4 },
  scoreValue: { fontSize: 28, fontWeight: 'bold' },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },
  zoneStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  zoneText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  zoneMessage: { fontSize: 12, color: '#666', marginTop: 4 },
  monitoringStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  monitoringText: { fontSize: 14, fontWeight: '600', color: '#4CAF50', marginLeft: 8 },
  monitoringDescription: { fontSize: 12, color: '#666' },
  emergencyCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  emergencyTitle: { fontSize: 16, fontWeight: 'bold', color: '#F57C00', marginBottom: 12 },
  emergencyContact: { marginBottom: 8 },
  contactName: { fontSize: 14, fontWeight: '600', color: '#333' },
  contactPhone: { fontSize: 12, color: '#666' },
});
