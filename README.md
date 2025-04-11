# react-native-apppricing

AppPricing SDK is an intelligent pricing optimization tool for mobile applications.

## Installation

```sh
npm install react-native-apppricing
# or
yarn add react-native-apppricing
```

## Usage

```js
import AppPricing from 'react-native-apppricing';

// Initialize the SDK with your API key
await AppPricing.initialize('YOUR_API_KEY');

// Get available plans for the current device
const plans = await AppPricing.getAvailablePlans();
console.log('Available plans:', plans);
```

## API Reference

### `initialize(apiKey: string): Promise<boolean>`

Initializes the AppPricing SDK with your API key. This function automatically:
- Collects device information
- Sends device data to the AppPricing servers
- Increments the session count for the device

Returns a Promise that resolves to `true` if initialization was successful, `false` otherwise.

### `getAvailablePlans(): Promise<Plan[]>`

Gets a list of plans available for the current device.

Returns a Promise that resolves to an array of Plan objects:

```ts
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}
```

### Device Data Collected

The SDK collects the following device information and sends it to the AppPricing service:

```ts
interface DeviceData {
  device_id: string;       // Unique device identifier
  hash: string;            // Device hash
  distinct: boolean;       // Whether this is a distinct device
  country: string;         // User's country
  region: string;          // User's region
  city: string;            // User's city
  timezone: string;        // User's timezone
  first_seen: string;      // When device was first seen (ISO date)
  last_seen: string;       // When device was last seen (ISO date)
  engagement_time: number; // Total engagement time in seconds
  session_count: number;   // Number of sessions
  language: string;        // Device language
  marka: string;           // Device manufacturer/brand
  model: string;           // Device model
  os: string;              // Operating system (iOS/Android)
  os_version: string;      // OS version
  screen_height: number;   // Screen height in pixels
  screen_width: number;    // Screen width in pixels
}
```

## Expo Compatibility

⚠️ **Important note for Expo users**:

This SDK contains native code and cannot be used with Expo Go. If you're using Expo, you need to:

1. Use a development build (Expo Dev Client)
2. Follow [Expo's guide on Development Builds](https://docs.expo.dev/development/introduction/)
3. Add this library as a native module in your Expo config

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
