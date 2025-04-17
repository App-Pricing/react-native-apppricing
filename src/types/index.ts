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
}

export interface FetchResponse<T> {
  ok: boolean;
  data?: T;
  error?: any;
}

export type PaymentType = 'past' | 'new';

export interface PaymentInfo {
  type: PaymentType;
  amount?: number | null;
  paid_at?: Date | string | null;
  details?: string | null;
}

export interface PaymentPayload {
  device_id: string;
  payments: PaymentInfo[];
}
