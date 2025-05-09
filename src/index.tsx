import { AppPricing } from './config';
import { ApiService } from './services/api';
import { DeviceService } from './services/device';
import type { AppPricingConfig, PaymentInfo, Plan } from './types';
import { PaymentType } from './types';
import { logMessage } from './utils/logger';
export { PaymentType };
export type { AppPricingConfig, PaymentInfo, Plan };

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

/**
 * Tracks a page view event for the current device
 * @param pageName Name or identifier of the page viewed
 * @param visitedAt Optional timestamp of when the page was visited (defaults to now)
 */
export const trackPageView = async (
  pageName: string,
  visitedAt?: Date | string
): Promise<boolean> => {
  if (!AppPricing.initialized) {
    logMessage('SDK not initialized. Call initialize() first');
    return false;
  }
  return ApiService.trackPageView(pageName, visitedAt);
};

/**
 * Tracks payment events associated with the current device.
 * @param payments An array of payment information objects.
 */
export const trackPayment = async (
  payments: PaymentInfo[]
): Promise<boolean> => {
  if (!AppPricing.initialized) {
    logMessage('SDK not initialized. Call initialize() first');
    return false;
  }

  if (!Array.isArray(payments) || payments.length === 0) {
    logMessage('Payments array must be provided and cannot be empty');
    return false;
  }

  // Basic validation for required fields in each payment
  for (const payment of payments) {
    // Check if amount is provided and is a number
    if (
      payment.amount === undefined ||
      payment.amount === null ||
      typeof payment.amount !== 'number'
    ) {
      logMessage(`Invalid or missing payment amount: ${payment.amount}`);
      return false;
    }
    // Check if product_id is provided (not null/undefined) AND is not a string
    if (
      payment.product_id !== undefined &&
      payment.product_id !== null &&
      typeof payment.product_id !== 'string'
    ) {
      logMessage(
        `Invalid payment product_id: Expected a string but received ${typeof payment.product_id}`
      );
      return false;
    }

    // Check if type is provided and if it's one of the allowed values
    if (
      payment.type !== undefined &&
      payment.type !== null &&
      !Object.values(PaymentType).includes(payment.type as PaymentType)
    ) {
      logMessage(`Invalid payment type provided: ${payment.type}`);
      return false;
    }
  }

  return ApiService.sendPaymentData(payments);
};

export default {
  initialize,
  getAvailablePlans,
  trackPageView,
  trackPayment,
  PaymentType,
};
