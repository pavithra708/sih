// services/feedbackService.js
import axios from "axios";

const BASE_URL = "http://YOUR_SERVER/api/feedback";

export const submitFeedback = async (alertId, isTrueAlert, reason) => {
  try {
    const res = await axios.post(`${BASE_URL}/submit`, {
      alertId,
      isTrueAlert,
      reason,
    });
    return res.data;
  } catch (err) {
    console.error("Feedback submission failed:", err);
    throw err;
  }
};

export const fetchFeedback = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/all`);
    return res.data; // array of feedback
  } catch (err) {
    console.error("Fetching feedback failed:", err);
    return [];
  }
};
