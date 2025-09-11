import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SafetyScoreCardProps {
  score: number;
}

export const SafetyScoreCard: React.FC<SafetyScoreCardProps> = ({ score }) => {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Caution';
    return 'High Risk';
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
          {score}
        </Text>
        <Text style={styles.scoreSubtext}>/ 100</Text>
      </View>
      <View style={styles.scoreInfo}>
        <Text style={styles.scoreTitle}>{t('home.safetyScore')}</Text>
        <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
          {getScoreLabel(score)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: -4,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});