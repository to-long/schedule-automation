import { LOGIN_URL, USER_AGENT } from './constants.js';
import type { User } from './types.js';

/** Shared browser-like headers for propel.vn API calls. `token` adds the bearer auth. */
export function headers(token?: string): Record<string, string> {
  return {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'origin': 'https://propel.vn',
    'referer': 'https://propel.vn/',
    'user-agent': USER_AGENT,
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

/** Log in with the user's credentials and return a fresh Sanctum bearer token. */
export async function login(user: User): Promise<string> {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email: user.email, password: user.password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed for ${user.name}: ${response.status} - ${await response.text()}`);
  }

  const json = (await response.json()) as { status?: number; token?: string };
  if (json.status !== 1 || !json.token) {
    throw new Error(`Login rejected for ${user.name}: ${JSON.stringify(json)}`);
  }
  return json.token;
}
