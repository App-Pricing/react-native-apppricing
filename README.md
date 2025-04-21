![App Pricing](https://dash.apppricing.com/1x.png)

# AppPricing SDK

**AppPricing SDK** is an intelligent pricing optimization tool for mobile applications. It leverages advanced algorithms to analyze user behavior and characteristics, delivering tailored pricing strategies for each individual user. By integrating this SDK, your app can dynamically display the right paywall—whether premium, standard, or basic—based on sophisticated backend analysis.

Visit the [App Pricing Dashboard](https://dash.apppricing.com/) to manage your pricing strategies or more details.

---

## Features

- **Dynamic Pricing**: Adjusts prices in real-time based on user behavior, location, and more.
- **User Segmentation**: Categorizes users into pricing tiers for maximum profitability.
- **Seamless Integration**: Easy-to-use SDK with minimal setup.

![App Pricing](https://dash.apppricing.com/3x.png)

---

## Installation

### Step 1. Add the package to your project

```sh
npm install @apppricing/react-native-apppricing
```

```sh
yarn add @apppricing/react-native-apppricing
```

### Step 2. Install required dependencies

This SDK requires the following dependency:

```sh
npm install react-native-device-info
```

```sh
yarn add react-native-device-info
```

For iOS, you may need to run:

```sh
cd ios && pod install
```

## Getting Started

### 1. Initialize the SDK

```js
import AppPricing from '@apppricing/react-native-apppricing';

// Initialize the SDK
useEffect(() => {
  const initializeSDK = async () => {
    try {
      await AppPricing.initialize('YOUR_API_KEY'); // Required: Your API key from AppPricing Dashboard
      console.log('AppPricing SDK initialized successfully');
    } catch (error) {
      console.error('AppPricing SDK initialization failed:', error);
    }
  };

  initializeSDK();
}, []);
```

To obtain your `YOUR_API_KEY`, log in to the AppPricing Dashboard, navigate to the Apps page, and copy your unique key.

### 2. Fetching Plans

After initializing the SDK, you can fetch available plans for the device and show the appropriate paywall:

```js
const [plans, setPlans] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const fetchPlans = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const availablePlans = await AppPricing.getAvailablePlans();
    setPlans(availablePlans);

    // Log the name of the first plan for demonstration
    if (availablePlans.length > 0) {
      console.log('Plan name:', availablePlans[0].name);
    }
  } catch (err) {
    setError(err.message);
    console.error('Error fetching plans:', err);
  } finally {
    setIsLoading(false);
  }
};
```

### Best Practices

1. **Pre-fetch Plans**
   - Call `getAvailablePlans()` well before showing the paywall
   - Don't wait for user interaction to fetch plans
   - Cache the response to provide instant paywall display when needed
   - This prevents unnecessary waiting time for users

### Common Issues

1. **Initialization Failures**
   - Verify API key is correct
   - Check internet connectivity
   - Ensure dependencies are properly installed

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
  apiKey: string; // Your AppPricing API key
  deviceId: string; // Device identifier (auto-generated)
  baseUrl: string; // API base URL (default: 'https://dash.apppricing.com/api')
  initialized: boolean; // Whether SDK is initialized
  enableLogging: boolean; // Whether to enable debug logging (default: true)
}
```

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

### `trackPageView(pageName: string, visitedAt?: Date | string): Promise<boolean>`

Tracks a page view event to AppPricing. This helps track user navigation patterns.

**Parameters:**

- `pageName` (required): The name or identifier of the page visited (e.g., 'SettingsScreen', 'ProductDetailPage').
- `visitedAt` (optional): A `Date` object or ISO date string representing when the page was visited. If omitted, the current timestamp is used.

**Example:**

```js
import AppPricing from '@apppricing/react-native-apppricing';

// Track that the user visited the 'Profile' screen now
AppPricing.trackPageView('Profile');

// Track that the user visited the 'Checkout' screen at a specific time
const specificTime = new Date();
AppPricing.trackPageView('Checkout', specificTime);
```

### `trackPayment(payments: PaymentInfo[]): Promise<boolean>`

Tracks one or more payment events associated with the current device. Call this after a user completes a purchase or payment action.

**Parameters:**

- `payments` (required): An array of `PaymentInfo` objects.

```ts
// Updated PaymentType definition
export type PaymentType =
  | 'trial'
  | 'new_sub'
  | 'renewal'
  | 'upgrade'
  | 'downgrade'
  | 'resubscribe'
  | 'refund'
  | 'offer'
  | 'promo';

// Updated PaymentInfo interface
export interface PaymentInfo {
  amount: number; // Required: The amount paid
  product_id: string; // Required: The identifier of the product/plan purchased
  type?: PaymentType | null; // Optional: Type of payment event (see PaymentType)
  paid_at?: Date | string | null; // Optional: When the payment occurred (Date object or ISO string). Defaults to now on the backend if null/omitted.
  currency?: string | null; // Optional: The currency code (e.g., 'USD', 'EUR')
  details?: string | null; // Optional: Any additional details (e.g., transaction ID)
}
```

**Example:**

```js
import AppPricing from '@apppricing/react-native-apppricing';

const paymentDetails = [
  {
    amount: 19.99,
    product_id: 'premium_annual_plan', // Added product_id
    type: 'new_sub', // Updated type value
    currency: 'USD',
    paid_at: new Date(),
    details: 'Transaction ID: 12345abc',
  },
];

// Send the payment information
AppPricing.trackPayment(paymentDetails).then((success) => {
  if (success) {
    console.log('Payment tracked successfully');
  } else {
    console.log('Failed to track payment');
  }
});

// Example tracking a past payment without amount/details
const pastPayment = [
  {
    amount: 100,
    product_id: 'basic_monthly_plan', // Added product_id
    type: 'renewal', // Updated type value
    paid_at: '2023-01-15T10:00:00Z',
  },
];
AppPricing.trackPayment(pastPayment);
```

## Device Data Collected

The SDK collects the following device information and sends it to the AppPricing service:

```ts
interface DeviceData {
  device_id: string; // Unique device identifier
  hash: string; // Device fingerprint (different from device_id)
  country: string; // User's country (retrieved via IP geolocation)
  region: string; // User's region (retrieved via IP geolocation)
  city: string; // User's city (retrieved via IP geolocation)
  timezone: string; // User's timezone (retrieved via IP geolocation)
  first_seen: string; // When device was first seen (ISO date)
  last_seen: string; // When device was last seen (ISO date)
  engagement_time: number; // Total engagement time in seconds
  session_count: number; // Number of sessions
  language: string; // Language based on country code
  brand: string; // Device manufacturer/brand
  model: string; // Device model
  os: string; // Operating system (iOS/Android)
  os_version: string; // OS version
  screen_height: number; // Screen height in pixels
  screen_width: number; // Screen width in pixels
}
```

## Support

For technical support and inquiries:

- Email: support@ondokuzon.com

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
