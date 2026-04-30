import type { Request } from 'express';

/**
 * Origin clients use to reach this API (scheme + host, no path, no trailing slash).
 * Uses `X-Forwarded-Proto` / `X-Forwarded-Host` when present (Heroku, Railway, etc.).
 * With Express `trust proxy` enabled, `req.protocol` follows the forwarded proto.
 */
export function publicApiBaseUrlFromRequest(req: Request): string | undefined {
  const host =
    req.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    req.get('host')?.trim();
  if (!host) return undefined;

  const scheme = (
    req.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    req.protocol ||
    'http'
  ).replace(/:$/, '');

  return `${scheme}://${host}`.replace(/\/+$/, '');
}
