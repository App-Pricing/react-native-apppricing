import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';

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

interface AppPricing {
  apiKey: string;
  deviceId: string;
  baseUrl: string;
  initialized: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
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

  // Get device locale
  const locales = RNLocalize.getLocales();
  const locale =
    locales.length > 0 ? (locales[0]?.languageTag ?? 'en-US') : 'en-US';

  // Get timezone
  const timezone = RNLocalize.getTimeZone();

  // Get manufacturer (brand)
  const brand = DeviceInfo.getBrand();

  // Get operating system
  const operatingSystem = DeviceInfo.getSystemName();
  const osVersion = DeviceInfo.getSystemVersion();

  return {
    device_id: deviceId,
    hash: hash,
    distinct: true,
    country: 'unknown', // Would need location permissions and geocoding
    region: 'unknown', // Would need location permissions and geocoding
    city: 'unknown', // Would need location permissions and geocoding
    timezone: await timezone,
    first_seen: installDate,
    last_seen: now,
    engagement_time: 0, // This would need to be tracked over time
    session_count: 1, // Starting with 1, will be incremented by API
    language: locale,
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
        'x-api-key': AppPricing.apiKey,
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
          'x-api-key': AppPricing.apiKey,
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
          'x-api-key': AppPricing.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get available plans: ${response.status}`);
    }

    const plans = await response.json();
    return plans;
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
