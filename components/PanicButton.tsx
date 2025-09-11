import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../contexts/LocationContext';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

export const PanicButton: React.FC = () => {
  const { t } = useTranslation();
  const { sendPanicAlert } = useLocation();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    Vibration.vibrate(500);

    Alert.alert(
      t('panic.title'),
      t('panic.message'),
      [
        {
          text: t('panic.cancel'),
          style: 'cancel',
          onPress: () => setIsPressed(false),
        },
        {
          text: t('panic.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await sendPanicAlert();
              Alert.alert('Success', t('panic.sent'));
            } catch (error) {
              Alert.alert('Error', t('panic.failed'));
            } finally {
              setIsPressed(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, isPressed && styles.buttonPressed]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <AlertTriangle size={32} color="#fff" />
        <Text style={styles.buttonText}>{t('home.panicButton')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    minHeight: 80,
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: '#D32F2F',
    transform: [{ scale: 0.95 }],
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
});