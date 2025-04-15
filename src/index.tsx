import { AppPricing } from './config';
import { ApiService } from './services/api';
import { DeviceService } from './services/device';
import type { AppPricingConfig, Plan } from './types';
import { logMessage } from './utils/logger';

/**
 * Initializes the AppPricing SDK with your API key and optional configuration
 */
export const initialize = async (
  apiKey: string,
  config?: Partial<AppPricingConfig>
): Promise<boolean> => {
  try {
    if (AppPricing.initialized) {
      return true; // Already initialized
    }

    if (!apiKey) {
      logMessage('API key is required');
      return false;
    }

    // Apply configuration
    Object.assign(AppPricing, { ...AppPricing, ...config, apiKey });

    try {
      // Get device data
      const deviceData = await DeviceService.getDeviceData();
      AppPricing.deviceId = deviceData.device_id;

      // Send device data to the API
      const dataSent = await ApiService.sendDeviceData(deviceData);
      if (!dataSent) {
        logMessage('Failed to send device data, but continuing initialization');
      }

      // Increment session count
      const sessionIncremented = await ApiService.incrementSession(
        deviceData.device_id
      );
      if (!sessionIncremented) {
        logMessage(
          'Failed to increment session, but continuing initialization'
        );
      }

      AppPricing.initialized = true;
      logMessage('Successfully initialized');
      return true;
    } catch (error) {
      logMessage('Error during initialization', error);
      return false;
    }
  } catch (error) {
    logMessage('Initialization failed', error);
    return false;
  }
};

/**
 * Gets available plans for the current device
 */
export const getAvailablePlans = async (): Promise<Plan[]> => {
  return ApiService.getAvailablePlans();
};

export default {
  initialize,
  getAvailablePlans,
};
