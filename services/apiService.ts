import axios from 'axios';
import { TouristProfile, Alert, Location, ApiResponse } from '../types';

// Replace with your actual backend URL
const API_BASE_URL = 'https://your-backend-url.com/api';

class ApiService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async registerTourist(tourist: Omit<TouristProfile, 'id'>): Promise<ApiResponse<TouristProfile>> {
    try {
      const response = await this.api.post('/register', tourist);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async getTouristById(id: string): Promise<ApiResponse<TouristProfile>> {
    try {
      const response = await this.api.get(`/id/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch tourist data' };
    }
  }

  async sendPanicAlert(touristId: string, alert: Alert): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/alert/panic', { touristId, ...alert });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send panic alert' };
    }
  }

  async sendGeofenceAlert(touristId: string, alert: Alert): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/alert/geofence', { touristId, ...alert });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send geofence alert' };
    }
  }

  async sendAnomalyAlert(touristId: string, alert: Alert): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/alert/anomaly', { touristId, ...alert });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send anomaly alert' };
    }
  }

  async startTracking(touristId: string): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/tracking/start', { touristId });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to start tracking' };
    }
  }

  async stopTracking(touristId: string): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/tracking/stop', { touristId });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to stop tracking' };
    }
  }

  async updateLocation(touristId: string, location: Location): Promise<ApiResponse<void>> {
    try {
      await this.api.post('/location/update', { touristId, location });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update location' };
    }
  }
}

export const apiService = new ApiService();