import { Location, GeofenceZone } from '../types';

class GeofenceService {
  private zones: GeofenceZone[] = [
    {
      id: '1',
      name: 'Restricted Military Area',
      coordinates: [
        { latitude: 12.9716, longitude: 77.5946, timestamp: Date.now() },
        { latitude: 12.9720, longitude: 77.5950, timestamp: Date.now() },
        { latitude: 12.9715, longitude: 77.5955, timestamp: Date.now() },
        { latitude: 12.9710, longitude: 77.5945, timestamp: Date.now() },
      ],
      riskLevel: 'high',
    },
    {
      id: '2',
      name: 'High Crime Area',
      coordinates: [
        { latitude: 12.9200, longitude: 77.6100, timestamp: Date.now() },
        { latitude: 12.9250, longitude: 77.6150, timestamp: Date.now() },
        { latitude: 12.9180, longitude: 77.6180, timestamp: Date.now() },
        { latitude: 12.9150, longitude: 77.6120, timestamp: Date.now() },
      ],
      riskLevel: 'medium',
    },
  ];

  isPointInZone(point: Location, zone: GeofenceZone): boolean {
    const coordinates = zone.coordinates;
    let inside = false;

    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      const xi = coordinates[i].latitude;
      const yi = coordinates[i].longitude;
      const xj = coordinates[j].latitude;
      const yj = coordinates[j].longitude;

      if (
        yi > point.longitude !== yj > point.longitude &&
        point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  checkLocation(location: Location): GeofenceZone | null {
    for (const zone of this.zones) {
      if (this.isPointInZone(location, zone)) {
        return zone;
      }
    }
    return null;
  }

  getAllZones(): GeofenceZone[] {
    return this.zones;
  }

  addZone(zone: GeofenceZone): void {
    this.zones.push(zone);
  }

  removeZone(zoneId: string): void {
    this.zones = this.zones.filter(zone => zone.id !== zoneId);
  }
}

export const geofenceService = new GeofenceService();