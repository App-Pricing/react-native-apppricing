import type { AppPricingConfig } from '../types';

// Default configuration
const DEFAULT_CONFIG = {
  apiKey: '',
  deviceId: '',
  baseUrl: 'https://dash.apppricing.com/api',
  initialized: false,
  enableLogging: true,
};

// SDK State
export const AppPricing: AppPricingConfig = { ...DEFAULT_CONFIG };

/**
 * Reset SDK config to default values
 */
export const resetConfig = () => {
  Object.assign(AppPricing, DEFAULT_CONFIG);
};
