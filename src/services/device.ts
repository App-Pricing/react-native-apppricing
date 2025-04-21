import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import type { DeviceData } from '../types';
import { logMessage } from '../utils/logger';
import { ApiService } from './api';

/**
 * Device Service for gathering device information
 */
export const DeviceService = {
  async getDeviceData(): Promise<DeviceData> {
    const deviceId = await DeviceInfo.getUniqueId();
    const hash = await DeviceInfo.getFingerprint();
    const now = new Date().toISOString();
    const installDate = await DeviceInfo.getFirstInstallTime().then(
      (timestamp: number) => new Date(timestamp).toISOString()
    );

    const { width: screenWidth, height: screenHeight } =
      Dimensions.get('window');
    const brand = DeviceInfo.getBrand();
    const operatingSystem = DeviceInfo.getSystemName();
    const osVersion = DeviceInfo.getSystemVersion();
    const model = await DeviceInfo.getModel();

    // Default location data and language
    let country = 'unknown';
    let region = 'unknown';
    let city = 'unknown';
    let timezone = 'UTC';
    let language = 'en-US';

    try {
      const locationData = await ApiService.getLocationData();

      if (locationData) {
        country = locationData.country || 'unknown';
        region = locationData.region || 'unknown';
        city = locationData.city || 'unknown';
        timezone = locationData.timezone || 'UTC';
        language = locationData.language || 'en-US';
      }
    } catch (error) {
      logMessage('Failed to fetch location data', error);
      // Using default values if API fails
    }

    return {
      device_id: deviceId,
      hash: hash,
      country,
      region,
      city,
      timezone,
      first_seen: installDate,
      last_seen: now,
      engagement_time: 0,
      session_count: 1,
      language: language,
      brand,
      model,
      os: operatingSystem,
      os_version: osVersion,
      screen_height: Math.round(screenHeight),
      screen_width: Math.round(screenWidth),
    };
  },
};
