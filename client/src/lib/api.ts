import axios, { type AxiosInstance } from 'axios';

declare global {
  interface Window { __API_URL__?: string }
}

function getBaseURL(): string {
  if (typeof window !== 'undefined' && window.__API_URL__) return window.__API_URL__;
  return import.meta.env.VITE_API_URL || '';
}

export const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const base = getBaseURL();
  if (base && config.baseURL !== base) {
    config.baseURL = base;
  }
  if (!config.url?.startsWith('/api') && !config.url?.startsWith('http')) {
    config.url = '/api' + (config.url?.startsWith('/') ? '' : '/') + (config.url ?? '');
  }
  return config;
});
