import { Location, Alert } from '../types';

interface AnomalyConfig {
  maxStationaryTime: number; // in milliseconds
  maxLocationJump: number; // in meters
  itineraryDeviationThreshold: number; // in meters
}

class AnomalyService {
  private config: AnomalyConfig = {
    maxStationaryTime: 30 * 60 * 1000, // 30 minutes
    maxLocationJump: 10000, // 10km
    itineraryDeviationThreshold: 5000, // 5km
  };

  private lastLocations: Location[] = [];
  private lastMovementTime: number = Date.now();

  checkForAnomalies(currentLocation: Location, plannedItinerary: string[]): Alert[] {
    const anomalies: Alert[] = [];

    // Check for stationary behavior
    if (this.isStationary(currentLocation)) {
      anomalies.push({
        type: 'anomaly',
        location: currentLocation,
        message: 'Tourist has been stationary for an extended period',
        timestamp: Date.now(),
      });
    }

    // Check for sudden location jumps
    if (this.hasSuddenLocationJump(currentLocation)) {
      anomalies.push({
        type: 'anomaly',
        location: currentLocation,
        message: 'Sudden significant change in location detected',
        timestamp: Date.now(),
      });
    }

    // Check for itinerary deviation
    if (this.hasDeviatedFromItinerary(currentLocation, plannedItinerary)) {
      anomalies.push({
        type: 'anomaly',
        location: currentLocation,
        message: 'Tourist has deviated significantly from planned itinerary',
        timestamp: Date.now(),
      });
    }

    // Update tracking data
    this.updateLocationHistory(currentLocation);

    return anomalies;
  }

  private isStationary(currentLocation: Location): boolean {
    if (this.lastLocations.length === 0) {
      return false;
    }

    const recentLocations = this.lastLocations.slice(-5);
    const avgDistance = this.calculateAverageDistance(recentLocations);

    if (avgDistance < 50 && Date.now() - this.lastMovementTime > this.config.maxStationaryTime) {
      return true;
    }

    if (avgDistance >= 50) {
      this.lastMovementTime = Date.now();
    }

    return false;
  }

  private hasSuddenLocationJump(currentLocation: Location): boolean {
    if (this.lastLocations.length === 0) {
      return false;
    }

    const lastLocation = this.lastLocations[this.lastLocations.length - 1];
    const distance = this.calculateDistance(lastLocation, currentLocation);
    const timeDiff = currentLocation.timestamp - lastLocation.timestamp;

    // If moved more than maxLocationJump in less than 5 minutes, it's suspicious
    return distance > this.config.maxLocationJump && timeDiff < 5 * 60 * 1000;
  }

  private hasDeviatedFromItinerary(currentLocation: Location, plannedItinerary: string[]): boolean {
    // This is a simplified implementation
    // In a real app, you would geocode the planned locations and check distances
    return false;
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private calculateAverageDistance(locations: Location[]): number {
    if (locations.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += this.calculateDistance(locations[i - 1], locations[i]);
    }

    return totalDistance / (locations.length - 1);
  }

  private updateLocationHistory(location: Location): void {
    this.lastLocations.push(location);
    
    // Keep only last 20 locations
    if (this.lastLocations.length > 20) {
      this.lastLocations = this.lastLocations.slice(-20);
    }
  }
}

export const anomalyService = new AnomalyService();