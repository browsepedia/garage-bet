import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/** Env var name; scheme base should match API `APP_DEEP_LINK_URL`. */
export const EXPO_PUBLIC_APP_DEEP_LINK_URL_ENV =
  'EXPO_PUBLIC_APP_DEEP_LINK_URL' as const;

/** Same path segment the API appends — `app/(auth)/email-verified.tsx`. */
export const EMAIL_VERIFIED_PATH_SEGMENT = 'email-verified' as const;

type AppExtra = {
  appDeepLinkBaseUrl?: string;
};

function fromExpoExtra(): string | undefined {
  const raw = (Constants.expoConfig?.extra as AppExtra | undefined)
    ?.appDeepLinkBaseUrl;
  return raw?.trim() || undefined;
}

function fromExpoScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  if (typeof scheme === 'string' && scheme) return `${scheme}:///`;
  if (Array.isArray(scheme) && scheme[0]) return `${scheme[0]}:///`;
  return 'garage-bet-app:///';
}

/**
 * Base URL for the app custom scheme (no `/email-verified` yet).
 * Order: `EXPO_PUBLIC_APP_DEEP_LINK_URL` → app.config `extra.appDeepLinkBaseUrl` → `scheme` from app.json.
 */
export function resolveAppDeepLinkBaseUrl(): string {
  return (
    process.env[EXPO_PUBLIC_APP_DEEP_LINK_URL_ENV]?.trim() ||
    fromExpoExtra() ||
    fromExpoScheme()
  );
}

/** Resolved once at module load (scheme root only). */
export const APP_DEEP_LINK_BASE_URL = resolveAppDeepLinkBaseUrl();

/**
 * Canonical deep link for the post–email-verification screen (matches API redirect).
 */
export function appEmailVerifiedDeepLinkUrl(): string {
  return Linking.createURL(`/${EMAIL_VERIFIED_PATH_SEGMENT}`);
}
