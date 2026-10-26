/**
 * Global API Gateway endpoint configuration for CabSafe.
 * Normalizes HTTP API Gateway endpoints (served from root on the $default stage)
 * and trims trailing slashes and redundant /default suffixes.
 */

export const DEFAULT_API_BASE_URL = 'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com';

export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;
  let url = raw.replace(/\/+$/, '');
  // HTTP API Gateway routes (/cabs, /events, /trips, /drivers) are mapped at the root of the $default stage.
  // Strip trailing /default if present to prevent 404 route misses.
  url = url.replace(/\/default$/, '');
  return url;
}
