// services/apiService.ts
const API_BASE = "http://192.168.19.170:5000"; // replace with your backend

export const apiService = {
  updateLocation: async (touristId: string | number | null, location: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ touristId, location }),
      });
      return res.ok ? res.json() : null;
    } catch (e) {
      console.warn("apiService.updateLocation failed", e);
      throw e;
    }
  },

  sendPanicAlert: async (touristId: string | number | null, alert: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/panic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ touristId, alert }),
      });
      return res.ok ? res.json() : null;
    } catch (e) {
      console.warn("apiService.sendPanicAlert failed", e);
      throw e;
    }
  },

  sendFeedback: async (alertId: string, feedback: { isTruePositive: boolean; notes?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, feedback }),
      });
      return res.ok ? res.json() : null;
    } catch (e) {
      console.warn("apiService.sendFeedback failed", e);
      throw e;
    }
  },
};
