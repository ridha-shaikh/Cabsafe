/**
 * Global API Gateway endpoint configuration for CabSafe.
 * Normalizes stage paths (ensuring /default is present for execute-api invoke URLs)
 * and trims trailing slashes to prevent double-slash URL corruption or duplicate stage suffixes.
 */

export const DEFAULT_API_BASE_URL = 'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com/default';

export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;
  let url = raw.replace(/\/+$/, '');

  // Collapse accidental duplicate /default suffixes if present (e.g. /default/default)
  url = url.replace(/(\/default)+$/, '/default');

  // If configured with raw API Gateway host without the stage name (/default), append it
  if (url.includes('.execute-api.') && !url.endsWith('/default') && !url.includes('/default/')) {
    url = `${url}/default`;
  }

  return url;
}
