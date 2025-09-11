// components/FeedbackAnalytics.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { getFeedbackHistory } from '../services/feedbackService';

const FeedbackAnalytics = () => {
  const feedback = getFeedbackHistory();
  const truePos = feedback.filter(f => f.feedback === 'true-positive').length;
  const falsePos = feedback.filter(f => f.feedback === 'false-positive').length;

  return (
    <View>
      <Text>True Positives: {truePos}</Text>
      <Text>False Positives: {falsePos}</Text>
    </View>
  );
};

export default FeedbackAnalytics;
