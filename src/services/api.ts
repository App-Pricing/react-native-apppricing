import { AppPricing } from '../config';
import type {
  DeviceData,
  FetchResponse,
  LocationData,
  PaymentInfo,
  PaymentPayload,
  Plan,
} from '../types';
import { logMessage } from '../utils/logger';

/**
 * API Service for handling all network requests
 */
export const ApiService = {
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
      'Content-Type': 'application/json',
      'X-API-KEY': AppPricing.apiKey,
    };
  },

  // API Endpoints
  async getLocationData(): Promise<LocationData | null> {
    const response = await this.fetch<LocationData>(
      'https://ifconfig.apppricing.com/json',
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
    const url = `${AppPricing.baseUrl}/device-data/${deviceId}/increment-session`;
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

  async trackPageView(
    pageName: string,
    visitedAt?: Date | string
  ): Promise<boolean> {
    if (!AppPricing.initialized || !AppPricing.deviceId) {
      logMessage('SDK not initialized or deviceId missing');
      return false;
    }

    const url = `${AppPricing.baseUrl}/pages`;
    const payload = {
      device_id: AppPricing.deviceId,
      page_name: pageName,
      visited_at: visitedAt
        ? new Date(visitedAt).toISOString()
        : new Date().toISOString(),
    };

    const response = await this.fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return response.ok;
  },

  async sendPaymentData(payments: PaymentInfo[]): Promise<boolean> {
    if (!AppPricing.initialized || !AppPricing.deviceId) {
      logMessage('SDK not initialized or deviceId missing');
      return false;
    }

    const url = `${AppPricing.baseUrl}/payments`;
    const payload: PaymentPayload = {
      device_id: AppPricing.deviceId,
      payments: payments.map((p) => ({
        ...p,
        paid_at: p.paid_at ? new Date(p.paid_at).toISOString() : null,
      })),
    };

    const response = await this.fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return response.ok;
  },
};
