// components/AlertPrompt.tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { submitFeedback } from '../services/feedbackService';
import { getScore } from '../services/scoreService';

type AlertPromptProps = {
  alertId: string;
  level: "yellow" | "red";
  onRespond: (response: string) => void;
};

const AlertPrompt = ({ alertId, level, onRespond }: AlertPromptProps) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleResponse = (response: string) => {
    onRespond(response);
    setShowFeedback(true);  // Show feedback prompt after initial response
  };

  const handleFeedback = (type: 'true-positive' | 'false-positive') => {
    submitFeedback({
      alertId,
      level,
      feedback: type,
      scoreAtTrigger: getScore(),
      timestamp: Date.now(),
    });
  };

  return (
    <View>
      <Text>{level === 'yellow' ? 'Are you okay?' : 'Are you safe?'}</Text>
      <Button title="Yes" onPress={() => handleResponse('yes')} />
      <Button title="No" onPress={() => handleResponse('no')} />
      {level === 'yellow' && <Button title="Ignore" onPress={() => handleResponse('ignore')} />}
      
      {showFeedback && (
        <View>
          <Text>Was this alert correct?</Text>
          <Button title="Yes, True Positive" onPress={() => handleFeedback('true-positive')} />
          <Button title="No, False Positive" onPress={() => handleFeedback('false-positive')} />
        </View>
      )}
    </View>
  );
};

export default AlertPrompt;
