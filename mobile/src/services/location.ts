import * as Location from 'expo-location';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const LocationService = {
  /**
   * Request GPS permission and return current device coordinates
   */
  async getCurrentLocation(): Promise<{ coordinates?: GpsCoordinates; error?: string }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return {
          error: 'Location permission was denied. Please enable GPS permissions or enter coordinates manually.',
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        coordinates: {
          latitude: parseFloat(location.coords.latitude.toFixed(6)),
          longitude: parseFloat(location.coords.longitude.toFixed(6)),
          accuracy: location.coords.accuracy ?? undefined,
        },
      };
    } catch (err: any) {
      return {
        error: err.message || 'Failed to capture GPS location.',
      };
    }
  },

  /**
   * Reverse geocode coordinates to approximate village/district
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<{
    district?: string;
    city?: string;
    region?: string;
  }> {
    try {
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result) {
        return {
          district: result.district || result.subregion || undefined,
          city: result.city || undefined,
          region: result.region || undefined,
        };
      }
      return {};
    } catch {
      return {};
    }
  }
};

