# react-native-apppricing

AppPricing SDK is an intelligent pricing optimization tool for mobile applications.

## Installation

```sh
npm install @apppricing/react-native-apppricing
# or
yarn add @apppricing/react-native-apppricing
```

### Required Dependencies

This SDK requires the following dependency:

```sh
# Install required dependency
npm install react-native-device-info
# or
yarn add react-native-device-info
```

For iOS, you may need to run:

```sh
cd ios && pod install
```

## Usage

```js
import AppPricing from '@apppricing/react-native-apppricing';

// Initialize the SDK with your API key
await AppPricing.initialize('YOUR_API_KEY');

// Or initialize with custom configuration
await AppPricing.initialize('YOUR_API_KEY', {
  baseUrl: 'https://custom-api.apppricing.com/api',
  enableLogging: true
});

// Get available plans for the current device
const plans = await AppPricing.getAvailablePlans();
console.log('Available plans:', plans);
```

## API Reference

### `initialize(apiKey: string, config?: Partial<AppPricingConfig>): Promise<boolean>`

Initializes the AppPricing SDK with your API key and optional configuration. This function automatically:
- Collects device information
- Sends device data to the AppPricing servers
- Increments the session count for the device

**Parameters:**
- `apiKey` (required): Your AppPricing API key
- `config` (optional): Configuration options

```ts
interface AppPricingConfig {
  apiKey: string;          // Your AppPricing API key
  deviceId: string;        // Device identifier (auto-generated)
  baseUrl: string;         // API base URL (default: 'https://dash.apppricing.com/api')
  initialized: boolean;    // Whether SDK is initialized
  enableLogging: boolean;  // Whether to enable debug logging (default: true)
}
```

Returns a Promise that resolves to `true` if initialization was successful, `false` otherwise.

### `getAvailablePlans(): Promise<Plan[]>`

Gets a list of plans available for the current device.

Returns a Promise that resolves to an array of Plan objects:

```ts
interface Plan {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
```

## Error Handling

The SDK includes robust error handling to ensure your app continues to function even if network requests fail. All API calls are safely wrapped with proper error handling.

If logging is enabled (default), relevant error information will be logged to the console, including:
- Request URL
- HTTP method
- Request payload
- Status code (if available)
- Error details

## Device Data Collected

The SDK collects the following device information and sends it to the AppPricing service:

```ts
interface DeviceData {
  device_id: string;       // Unique device identifier
  hash: string;            // Device fingerprint (different from device_id)
  country: string;         // User's country (retrieved via IP geolocation)
  region: string;          // User's region (retrieved via IP geolocation)
  city: string;            // User's city (retrieved via IP geolocation)
  timezone: string;        // User's timezone (retrieved via IP geolocation)
  first_seen: string;      // When device was first seen (ISO date)
  last_seen: string;       // When device was last seen (ISO date)
  engagement_time: number; // Total engagement time in seconds
  session_count: number;   // Number of sessions
  language: string;        // Language based on country code
  brand: string;           // Device manufacturer/brand
  model: string;           // Device model
  os: string;              // Operating system (iOS/Android)
  os_version: string;      // OS version
  screen_height: number;   // Screen height in pixels
  screen_width: number;    // Screen width in pixels
}
```

## Project Structure

The SDK is organized into the following modules:

- `config`: SDK configuration and state management
- `types`: TypeScript type definitions
- `utils`: Utility functions like logging
- `services`:
  - `api`: API service for handling network requests
  - `device`: Device service for gathering device information

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
