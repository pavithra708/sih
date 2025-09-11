import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { geofenceService } from '../../services/geofenceService';
import { Shield, MapPin, Activity, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function SafetyScreen() {
  const { t } = useTranslation();
  const { tourist } = useAuth();
  const { currentLocation, safetyScore } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [currentZone, setCurrentZone] = useState<any>(null);

  useEffect(() => {
    if (currentLocation) {
      checkCurrentZone();
    }
  }, [currentLocation]);

  const checkCurrentZone = () => {
    if (currentLocation) {
      const zone = geofenceService.checkLocation(currentLocation);
      setCurrentZone(zone);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    checkCurrentZone();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
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
        title: t('safety.safeZone'),
        message: 'You are in a safe area',
      };
    }

    return {
      icon: AlertTriangle,
      color: currentZone.riskLevel === 'high' ? '#F44336' : '#FF9800',
      title: t('safety.dangerZone'),
      message: `${t('safety.exitZone')}\nZone: ${currentZone.name}`,
    };
  };

  const zoneStatus = getZoneStatus();
  const StatusIcon = zoneStatus.icon;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>{t('safety.title')}</Text>

      {/* Safety Score */}
      <View style={styles.scoreCard}>
        <Shield size={32} color={getScoreColor(safetyScore)} />
        <View style={styles.scoreContent}>
          <Text style={styles.scoreTitle}>{t('safety.score')}</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(safetyScore) }]}>
            {safetyScore}/100
          </Text>
        </View>
      </View>

      {/* Location Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MapPin size={24} color="#2196F3" />
          <Text style={styles.statusTitle}>{t('safety.geofence')}</Text>
        </View>
        <View style={styles.zoneStatus}>
          <StatusIcon size={20} color={zoneStatus.color} />
          <Text style={[styles.zoneText, { color: zoneStatus.color }]}>
            {zoneStatus.title}
          </Text>
        </View>
        {currentZone && (
          <Text style={styles.zoneMessage}>{zoneStatus.message}</Text>
        )}
      </View>

      {/* Activity Monitoring */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Activity size={24} color="#4CAF50" />
          <Text style={styles.statusTitle}>{t('safety.anomaly')}</Text>
        </View>
        <View style={styles.monitoringStatus}>
          <CheckCircle size={20} color="#4CAF50" />
          <Text style={styles.monitoringText}>Activity monitoring active</Text>
        </View>
        <Text style={styles.monitoringDescription}>
          We're monitoring your movement patterns for unusual activity
        </Text>
      </View>

      {/* Emergency Contacts Quick Access */}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  scoreContent: {
    flex: 1,
    marginLeft: 16,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  zoneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  zoneMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  monitoringStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  monitoringText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  monitoringDescription: {
    fontSize: 12,
    color: '#666',
  },
  emergencyCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 12,
  },
  emergencyContact: {
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 12,
    color: '#666',
  },
});