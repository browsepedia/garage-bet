import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../storage/token-storage';

const API_URL = resolveApiUrl();

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    await setTokens(data);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!path.startsWith('http') && !API_URL) {
    throw new Error(
      'Missing API base URL. Set EXPO_PUBLIC_API_URL (for example http://10.0.2.2:3000/api).',
    );
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  console.log('apiFetch', url);

  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body)
    headers.set('Content-Type', 'application/json');

  const access = await getAccessToken();
  if (access) headers.set('Authorization', `Bearer ${access}`);

  const res = await fetch(url, { ...init, headers });

  // Access token expired → refresh → retry once
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) return res;

    const retryHeaders = new Headers(init.headers || {});
    if (!retryHeaders.has('Content-Type') && init.body)
      retryHeaders.set('Content-Type', 'application/json');
    retryHeaders.set('Authorization', `Bearer ${newAccess}`);

    return fetch(url, { ...init, headers: retryHeaders });
  }

  return res;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
  }
}

// Use this everywhere from queries/mutations
export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await apiFetch(path, init);

  // allow empty 204
  const text = await res.text();
  const body = text ? safeJson(text) : undefined;

  if (!res.ok) {
    throw new ApiError(
      (body as any)?.message ?? `Request failed: ${res.status}`,
      res.status,
      body,
    );
  }

  return body as T;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function resolveApiUrl() {
  return 'https://garage-bet-api-5f371ca7b557.herokuapp.com/api';

  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (__DEV__) {
    return 'http://10.0.2.2:3000/api';
  }

  return 'https://garage-bet-api-5f371ca7b557.herokuapp.com/api';
}
