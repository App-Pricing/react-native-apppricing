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
    let response: Response | undefined; // Keep response reference

    try {
      // Attempt to parse payload for logging if it's a JSON string
      if (options.body && typeof options.body === 'string') {
        try {
          payload = JSON.parse(options.body);
        } catch (e) {
          payload = options.body; // Keep original body if not JSON
        }
      } else {
        payload = options.body; // Keep original body if not string or not present
      }

      response = await fetch(url, options); // Perform the fetch

      if (!response.ok) {
        let errorText = response.statusText; // Default error text
        try {
          // Try to get more specific error text from the response body
          errorText = await response.text();
          logMessage('Received error response body:', errorText); // Log the raw error text
        } catch (textError) {
          // Ignore error reading response text, use statusText
          logMessage('Could not read error response body', textError);
        }

        const errorMessage = `API error: ${response.status} - ${errorText}`;
        // Log detailed error information including the response text if available
        logMessage(errorMessage, null, {
          url,
          method,
          payload,
          statusCode: response.status,
          responseText:
            errorText !== response.statusText ? errorText : undefined, // Add response text if successfully read
        });
        throw new Error(errorMessage); // Throw error to be caught by the outer catch
      }

      // Log successful requests (consider removing payload logging for sensitive data if necessary)
      logMessage('API request successful', null, {
        url,
        method,
        // payload, // Commented out: Avoid logging potentially sensitive request bodies on success
        statusCode: response.status,
      });

      // Try parsing JSON response
      const data = await response.json();
      return { ok: true, data };
    } catch (error: any) {
      // Catch errors from fetch(), !response.ok throw, or response.json()
      // Log the caught error along with request context
      logMessage(`Fetch processing error`, error, {
        url,
        method,
        payload, // Log payload in case of error for debugging
        statusCode: response?.status, // Include status code if response object exists
      });

      // Ensure the error message passed back is a string
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // Return a standardized error response
      return { ok: false, error: errorMessage };
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
