export interface TouristProfile {
  id: string;
  name: string;
  aadhaarPassport: string;
  phone: string;
  email: string;
  tripStartDate: string;
  tripEndDate: string;
  itinerary: string[];
  emergencyContacts: EmergencyContact[];
  safetyScore: number;
  isTrackingEnabled: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Alert {
  type: 'panic' | 'geofence' | 'anomaly';
  location: Location;
  message: string;
  timestamp: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  coordinates: Location[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Language = 'en' | 'hi' | 'kn';