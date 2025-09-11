import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { submitFeedback, getFeedbackHistory } from '../services/feedbackService';

// Correct FeedbackEntry type: timestamp as number
export type FeedbackEntry = {
  alertId: string;
  level: 'yellow' | 'red';
  timestamp: number; // keep as number
  feedback: string;
  scoreAtTrigger: number;
};

// Context type
type FeedbackContextType = {
  feedbackHistory: FeedbackEntry[];
  addFeedback: (entry: FeedbackEntry) => Promise<void>;
};

// Create context
export const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);

  // Load feedback history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getFeedbackHistory();
      setFeedbackHistory(history); // timestamp is already number
    };
    loadHistory();
  }, []);

  // Add new feedback
  const addFeedback = async (entry: FeedbackEntry) => {
    await submitFeedback(entry);
    const updatedHistory = await getFeedbackHistory();
    setFeedbackHistory(updatedHistory);
  };

  return (
    <FeedbackContext.Provider value={{ feedbackHistory, addFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};
