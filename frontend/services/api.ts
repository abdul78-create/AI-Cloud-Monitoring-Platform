import axios from "axios";
import { ApiResponse } from "@/types";

const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: backendBaseUrl,
  timeout: 20000
});

const cache = new Map<string, { expiresAt: number; value: unknown }>();

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Unexpected API error";
    return Promise.reject(new Error(status ? `[${status}] ${message}` : message));
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
