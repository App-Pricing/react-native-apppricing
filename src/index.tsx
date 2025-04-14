import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

interface DeviceData {
  device_id: string;
  hash: string;
  distinct: boolean;
  country: string;
  region: string;
  city: string;
  timezone: string;
  first_seen: string;
  last_seen: string;
  engagement_time: number;
  session_count: number;
  language: string;
  marka: string;
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

interface AppPricing {
  apiKey: string;
  deviceId: string;
  baseUrl: string;
  initialized: boolean;
}

interface Plan {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const APP_PRICING_BASE_URL = 'https://dash.apppricing.com/api';

const AppPricing: AppPricing = {
  apiKey: '',
  deviceId: '',
  baseUrl: APP_PRICING_BASE_URL,
  initialized: false,
};

/**
 * Collects current device information
 */
const getDeviceData = async (): Promise<DeviceData> => {
  const deviceId = await DeviceInfo.getUniqueId();
  const hash = await DeviceInfo.getUniqueId(); // Using uniqueId as hash
  const now = new Date().toISOString();
  const installDate = await DeviceInfo.getFirstInstallTime().then(
    (timestamp: number) => new Date(timestamp).toISOString()
  );

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Get manufacturer (brand)
  const brand = DeviceInfo.getBrand();

  // Get operating system
  const operatingSystem = DeviceInfo.getSystemName();
  const osVersion = DeviceInfo.getSystemVersion();

  // Default values before API call
  let country = 'unknown';
  let region = 'unknown';
  let city = 'unknown';
  let timezone = 'UTC';
  let language = 'en-US';

  try {
    const locationResponse = await fetch(
      'https://ifconfig.mehmetcansahin.com/json'
    );
    if (locationResponse.ok) {
      const locationData: LocationData = await locationResponse.json();
      country = locationData.country || 'unknown';
      region = locationData.region || 'unknown';
      city = locationData.city || 'unknown';

      // Use API timezone if available
      if (locationData.timezone) {
        timezone = locationData.timezone;
      }

      // Generate locale from country_code if available
      if (locationData.country_code) {
        const countryCode = locationData.country_code;

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
        const primaryLanguage = countryToLanguage[countryCode] || 'en';

        // Create a locale string
        language = `${primaryLanguage}-${countryCode}`;
      }
    }
  } catch (error) {
    console.error('Failed to fetch location data:', error);
    // Using default values if API fails
  }

  return {
    device_id: deviceId,
    hash: hash,
    distinct: true,
    country: country,
    region: region,
    city: city,
    timezone: timezone,
    first_seen: installDate,
    last_seen: now,
    engagement_time: 0, // This would need to be tracked over time
    session_count: 1, // Starting with 1, will be incremented by API
    language: language,
    marka: brand,
    model: await DeviceInfo.getModel(),
    os: operatingSystem,
    os_version: osVersion,
    screen_height: Math.round(screenHeight),
    screen_width: Math.round(screenWidth),
  };
};

/**
 * Initializes the AppPricing SDK with your API key
 */
export const initialize = async (apiKey: string): Promise<boolean> => {
  try {
    if (!apiKey) {
      console.error('AppPricing: API key is required');
      return false;
    }

    AppPricing.apiKey = apiKey;

    // Get device data
    const deviceData = await getDeviceData();
    AppPricing.deviceId = deviceData.device_id;

    // Send device data to the API
    await sendDeviceData(deviceData);

    // Increment session count
    await incrementSession(deviceData.device_id);

    AppPricing.initialized = true;
    return true;
  } catch (error) {
    console.error('AppPricing: Initialization failed', error);
    return false;
  }
};

/**
 * Sends device data to the AppPricing API
 */
export const sendDeviceData = async (
  deviceData: DeviceData
): Promise<boolean> => {
  try {
    const response = await fetch(`${AppPricing.baseUrl}/device_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': AppPricing.apiKey,
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      throw new Error(`Failed to send device data: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('AppPricing: Failed to send device data', error);
    return false;
  }
};

/**
 * Increments the session count for a device
 */
export const incrementSession = async (deviceId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${AppPricing.baseUrl}/device_data/${deviceId}/increment_session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': AppPricing.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to increment session: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('AppPricing: Failed to increment session', error);
    return false;
  }
};

/**
 * Gets available plans for the current device
 */
export const getAvailablePlans = async (): Promise<Plan[]> => {
  if (!AppPricing.initialized) {
    console.error('AppPricing: SDK not initialized. Call initialize() first');
    return [];
  }

  try {
    const response = await fetch(
      `${AppPricing.baseUrl}/device_data/${AppPricing.deviceId}/plans`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': AppPricing.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get available plans: ${response.status}`);
    }

    const data = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error('AppPricing: Failed to get available plans', error);
    return [];
  }
};

export default {
  initialize,
  getAvailablePlans,
  sendDeviceData,
  incrementSession,
};
