/**
 * Global API Gateway endpoint configuration for CabSafe.
 * Normalizes stage paths (ensuring /default is present for execute-api)
 * and trims trailing slashes to prevent double-slash URL corruption.
 */

export const DEFAULT_API_BASE_URL = 'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com/default';

export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;
  let url = raw.replace(/\/+$/, '');
  // If user configured raw API Gateway host without the stage name (/default), append it
  if (url.includes('.execute-api.') && !url.endsWith('/default') && !url.includes('/default/')) {
    url = `${url}/default`;
  }
  return url;
}
