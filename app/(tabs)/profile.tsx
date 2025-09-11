import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeView } from '../../components/QRCodeView';
import { User, Phone, Mail, MapPin, Users } from 'lucide-react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { tourist } = useAuth();

  if (!tourist) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  const qrData = JSON.stringify({
    id: tourist.id,
    name: tourist.name,
    validUntil: tourist.tripEndDate,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profile.digitalId')}</Text>
      
      <View style={styles.idCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Digital Tourist ID</Text>
          <Text style={styles.cardId}>ID: {tourist.id.slice(-8).toUpperCase()}</Text>
        </View>
        
        <QRCodeView data={qrData} size={150} />
        
        <Text style={styles.scanText}>{t('profile.scanCode')}</Text>
        <Text style={styles.validText}>
          {t('profile.validUntil')}: {new Date(tourist.tripEndDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <User size={20} color="#2196F3" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{tourist.name}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Phone size={20} color="#2196F3" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{tourist.phone}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Mail size={20} color="#2196F3" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{tourist.email}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={20} color="#2196F3" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{t('profile.itinerary')}</Text>
            <Text style={styles.detailValue}>{tourist.itinerary.join(', ')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>{t('profile.emergencyContacts')}</Text>
        {tourist.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactItem}>
            <Users size={20} color="#FF9800" />
            <View style={styles.contactContent}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
            </View>
          </View>
        ))}
      </View>
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
  idCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  scanText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  validText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emergencySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 100,
  },
});