/** Env var name for {@link appDeepLinkBaseUrl}. */
export const APP_DEEP_LINK_URL_ENV = 'APP_DEEP_LINK_URL' as const;

/**
 * Expo Router path for `app/(auth)/email-verified.tsx` (route groups are omitted from the URL).
 */
export const EMAIL_VERIFIED_APP_PATH_SEGMENT = 'email-verified' as const;

/**
 * Base of the app custom scheme (no `email-verified` segment yet).
 * Env: `APP_DEEP_LINK_URL` — e.g. `garage-bet-app:///`
 */
export function appDeepLinkBaseUrl(): string {
  const raw = process.env[APP_DEEP_LINK_URL_ENV]?.trim();
  return raw || 'garage-bet-app:///';
}

function alreadyOpensEmailVerifiedScreen(url: string): boolean {
  return /(^|\/)email-verified(\/|$|\?)/i.test(url);
}

/**
 * `Location` header after the user confirms email in a browser — opens `/(auth)/email-verified` in the app.
 * If `APP_DEEP_LINK_URL` already ends with `email-verified`, it is returned as-is (for custom / universal links).
 */
export function buildEmailVerifiedAppDeepLink(): string {
  const base = appDeepLinkBaseUrl().trim();
  const seg = EMAIL_VERIFIED_APP_PATH_SEGMENT;
  const withoutQuery = base.split('?')[0];

  if (alreadyOpensEmailVerifiedScreen(withoutQuery)) {
    return withoutQuery.replace(/\/+$/, '');
  }

  const sepIdx = withoutQuery.indexOf('://');
  if (sepIdx === -1) {
    return `${withoutQuery.replace(/\/+$/, '')}/${seg}`;
  }

  const proto = withoutQuery.slice(0, sepIdx + 3);
  const rest = withoutQuery.slice(sepIdx + 3);

  if (rest === '' || rest === '/') {
    return `${proto}/${seg}`;
  }

  return `${proto}${rest.replace(/\/+$/, '')}/${seg}`;
}
