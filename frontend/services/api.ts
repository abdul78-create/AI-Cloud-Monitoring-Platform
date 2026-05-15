import axios from "axios";
import { ApiResponse } from "@/types";

const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: backendBaseUrl,
  timeout: 5000,
});

const cache = new Map<string, { expiresAt: number; value: unknown }>();

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Only retry on network errors or 5xx server errors
    const shouldRetry = !error.response || (error.response.status >= 500 && error.response.status <= 599);
    
    // Default to 3 retries if not specified, but only if shouldRetry is true
    const retryCount = config && 'retry' in config ? (config.retry as number) : 1;
    
    if (!config || !shouldRetry || retryCount <= 0) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Unexpected API error";
      return Promise.reject(new Error(status ? `[${status}] ${message}` : message));
    }
    
    config.__retryCount = config.__retryCount || 0;
    
    if (config.__retryCount >= retryCount) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || "Unexpected API error";
      return Promise.reject(new Error(status ? `[${status}] ${message}` : message));
    }
    
    config.__retryCount += 1;
    
    const delay = Math.pow(2, config.__retryCount) * 1000;
    console.warn(`[API] Request failed. Retrying in ${delay}ms... (Attempt ${config.__retryCount}/${retryCount})`);
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    return api(config);
  }
);

export const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const getWithCache = async <T>(url: string, ttlMs: number): Promise<T> => {
  const now = Date.now();
  const entry = cache.get(url);
  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }
  const response = await api.get<ApiResponse<T>>(url);
  const value = response.data.data;
  cache.set(url, { value, expiresAt: now + ttlMs });
  return value;
};
