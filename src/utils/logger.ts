import { AppPricing } from '../config';
import type { RequestDetails } from '../types';

/**
 * Helper for consistent logging across the app
 */
export const logMessage = (
  message: string,
  error?: any,
  requestDetails?: RequestDetails
) => {
  if (AppPricing.enableLogging) {
    const details = requestDetails
      ? `[${requestDetails.method || 'GET'} ${requestDetails.url || ''} ${requestDetails.statusCode || ''}]`
      : '';

    if (error) {
      console.error(`AppPricing: ${message} ${details}`, error);
      if (requestDetails?.payload) {
        console.error('Request payload:', requestDetails.payload);
      }
    } else {
      console.log(`AppPricing: ${message} ${details}`);
      if (requestDetails?.payload) {
        console.log('Request payload:', requestDetails.payload);
      }
    }
  }
};
