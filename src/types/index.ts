export interface DeviceData {
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

export interface LocationData {
  ip: string;
  country_code: string;
  country: string;
  city: string;
  region: string;
  region_code: string;
  timezone: string;
  longitude: string;
  latitude: string;
  language: string;
}

export interface AppPricingConfig {
  apiKey: string;
  deviceId: string;
  baseUrl: string;
  initialized: boolean;
  enableLogging: boolean;
}

export interface Plan {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RequestDetails {
  url?: string;
  method?: string;
  payload?: any;
  statusCode?: number;
  responseText?: string;
}

export interface FetchResponse<T> {
  ok: boolean;
  data?: T;
  error?: any;
}

// Define PaymentType as an enum
export enum PaymentType {
  Trial = 'trial',
  NewSub = 'new_sub',
  Renewal = 'renewal',
  Upgrade = 'upgrade',
  Downgrade = 'downgrade',
  Resubscribe = 'resubscribe',
  Refund = 'refund',
  Offer = 'offer',
  Promo = 'promo',
}

export interface PaymentInfo {
  type?: PaymentType | null;
  amount: number;
  product_id?: string | null;
  paid_at?: Date | string | null;
  currency?: string | null;
  details?: string | null;
}

export interface PaymentPayload {
  device_id: string;
  payments: PaymentInfo[];
}
