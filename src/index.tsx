import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Constants
const CONSTANTS = {
  BASE_URL: 'https://dash.apppricing.com/api',
  LOCATION_API_URL: 'https://ifconfig.mehmetcansahin.com/json',
  DEFAULT_COUNTRY: 'unknown',
  DEFAULT_REGION: 'unknown',
  DEFAULT_CITY: 'unknown',
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_LANGUAGE: 'en-US',
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    API_KEY: 'X-API-KEY',
    CONTENT_TYPE_JSON: 'application/json',
  },
};

// Types
interface DeviceData {
  device_id: string;
  hash: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  first_seen: string;
  last_seen: string;
  engagement_time: number;
  session_count: number;
  language: string;
  brand: string;
  model: string;
  os: string;
  os_version: string;
  screen_height: number;
  screen_width: number;
}

interface LocationData {
  ip: string;
  country_code: string;
  country: string;
  city: string;
  region: string;
  region_code: string;
  timezone: string;
  longitude: string;
  latitude: string;
}

interface AppPricingConfig {
  apiKey: string;
  deviceId: string;
  baseUrl: string;
  initialized: boolean;
  enableLogging: boolean;
}

interface Plan {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface RequestDetails {
  url?: string;
  method?: string;
  payload?: any;
  statusCode?: number;
}

interface FetchResponse<T> {
  ok: boolean;
  data?: T;
  error?: any;
}

// Configuration
const DEFAULT_CONFIG: AppPricingConfig = {
  apiKey: '',
  deviceId: '',
  baseUrl: CONSTANTS.BASE_URL,
  initialized: false,
  enableLogging: true,
};

// SDK State
const AppPricing: AppPricingConfig = { ...DEFAULT_CONFIG };

// Helper for consistent logging
const logMessage = (
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

// API Service
const ApiService = {
  async fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<FetchResponse<T>> {
    const method = options.method || 'GET';
    let payload;

    try {
      if (options.body && typeof options.body === 'string') {
        try {
          payload = JSON.parse(options.body);
        } catch (e) {
          payload = options.body;
        }
      } else {
        payload = options.body;
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        logMessage(
          `API error: ${response.status} ${response.statusText}`,
          null,
          {
            url,
            method,
            payload,
            statusCode: response.status,
          }
        );
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Log successful requests
      logMessage('API request successful', null, {
        url,
        method,
        payload,
        statusCode: response.status,
      });

      return { ok: true, data: await response.json() };
    } catch (error) {
      logMessage(`Fetch error`, error, { url, method, payload });
      return { ok: false, error };
    }
  },

  getAuthHeaders() {
    return {
      [CONSTANTS.HEADERS.CONTENT_TYPE]: CONSTANTS.HEADERS.CONTENT_TYPE_JSON,
      [CONSTANTS.HEADERS.API_KEY]: AppPricing.apiKey,
    };
  },

  // API Endpoints
  async getLocationData(): Promise<LocationData | null> {
    const response = await this.fetch<LocationData>(
      CONSTANTS.LOCATION_API_URL,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.ok ? response.data || null : null;
  },

  async sendDeviceData(deviceData: DeviceData): Promise<boolean> {
    const url = `${AppPricing.baseUrl}/device-data`;
    const response = await this.fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(deviceData),
    });
    return response.ok;
  },

  async incrementSession(deviceId: string): Promise<boolean> {
    const url = `${AppPricing.baseUrl}/device-data/${deviceId}/increment_session`;
    const response = await this.fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return response.ok;
  },

  async getAvailablePlans(): Promise<Plan[]> {
    if (!AppPricing.initialized) {
      logMessage('SDK not initialized. Call initialize() first');
      return [];
    }

    const url = `${AppPricing.baseUrl}/device-data/${AppPricing.deviceId}/plans`;
    const response = await this.fetch<{ plans: Plan[] }>(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return response.ok && response.data ? response.data.plans || [] : [];
  },
};

// Device Service
const DeviceService = {
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

    // Default location data
    let country = CONSTANTS.DEFAULT_COUNTRY;
    let region = CONSTANTS.DEFAULT_REGION;
    let city = CONSTANTS.DEFAULT_CITY;
    let timezone = CONSTANTS.DEFAULT_TIMEZONE;
    let language = CONSTANTS.DEFAULT_LANGUAGE;

    try {
      const locationData = await ApiService.getLocationData();

      if (locationData) {
        country = locationData.country || CONSTANTS.DEFAULT_COUNTRY;
        region = locationData.region || CONSTANTS.DEFAULT_REGION;
        city = locationData.city || CONSTANTS.DEFAULT_CITY;
        timezone = locationData.timezone || CONSTANTS.DEFAULT_TIMEZONE;

        // Generate locale from country_code if available
        if (locationData.country_code) {
          // Direct mapping from country code to primary language
          const countryToLanguage: Record<string, string> = {
            US: 'en',
            GB: 'en',
            CA: 'en',
            AU: 'en',
            NZ: 'en',
            FR: 'fr',
            DE: 'de',
            IT: 'it',
            ES: 'es',
            PT: 'pt',
            BR: 'pt',
            NL: 'nl',
            BE: 'nl',
            TR: 'tr',
            RU: 'ru',
            JP: 'ja',
            CN: 'zh',
            TW: 'zh',
            KR: 'ko',
            AR: 'es',
            MX: 'es',
            CL: 'es',
            CO: 'es',
            IN: 'hi',
            PL: 'pl',
            SE: 'sv',
            NO: 'no',
            DK: 'da',
            FI: 'fi',
            CZ: 'cs',
            GR: 'el',
            IL: 'he',
            SA: 'ar',
            AE: 'ar',
            TH: 'th',
            VN: 'vi',
            ID: 'id',
            MY: 'ms',
            PH: 'tl',
          };

          // Get the language for this country or default to English
          const primaryLanguage =
            countryToLanguage[locationData.country_code] || 'en';
          language = `${primaryLanguage}-${locationData.country_code}`;
        }
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
      language,
      brand,
      model,
      os: operatingSystem,
      os_version: osVersion,
      screen_height: Math.round(screenHeight),
      screen_width: Math.round(screenWidth),
    };
  },
};

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
    Object.assign(AppPricing, { ...DEFAULT_CONFIG, ...config, apiKey });

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
