// services/feedbackStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveFeedbackToStorage = async (entry: any) => {
  const raw = await AsyncStorage.getItem('feedbackHistory');
  const history = raw ? JSON.parse(raw) : [];
  history.push(entry);
  await AsyncStorage.setItem('feedbackHistory', JSON.stringify(history));
};

export const loadFeedbackFromStorage = async () => {
  const raw = await AsyncStorage.getItem('feedbackHistory');
  return raw ? JSON.parse(raw) : [];
};
