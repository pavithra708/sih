// services/feedbackService.ts

type FeedbackType = 'true-positive' | 'false-positive';

interface FeedbackEntry {
  alertId: string;
  level: 'yellow' | 'red';
  timestamp: number;
  feedback: FeedbackType;
  scoreAtTrigger: number;
}

const feedbackStore: FeedbackEntry[] = [];

export const submitFeedback = (entry: FeedbackEntry) => {
  feedbackStore.push(entry);
  console.log('[Feedback] Recorded:', entry);
};

export const getFeedbackHistory = () => feedbackStore;
