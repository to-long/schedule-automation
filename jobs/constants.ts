import 'dotenv/config';
import type { User } from './types.js';

/**
 * Per-user: primary `token` (used first) + env prefix for the fallback credentials.
 * When the token dies (401), the job re-logins with USERNAME_<PREFIX>/PASSWORD_<PREFIX>.
 */
const USER_META = [
  {
    name: 'Long',
    prefix: 'LONG',
    token: '153832|T8Zsr5EgZeM1kpQIbPeqyHTmccHqyjkNEcZ0GciT',
    lat: 20.97148857955816,
    lng: 105.85263257121294,
  },
  {
    name: 'Nam',
    prefix: 'NAM',
    token: '149144|ujMHJj9a7e2dXaMHrlpSKwLfwCcgVhi2B6E00tzV',
    lat: 21.02260493677713,
    lng: 105.8312632165888,
    lastWorkingDay: '25/10/2026',
  },
] as const;

// Credentials come from .env locally / GitHub Actions secrets in CI (empty string if unset).
export const USERS: User[] = USER_META.map((m) => ({
  name: m.name,
  token: m.token,
  email: process.env[`USERNAME_${m.prefix}`] ?? '',
  password: process.env[`PASSWORD_${m.prefix}`] ?? '',
  lat: m.lat,
  lng: m.lng,
  lastWorkingDay: 'lastWorkingDay' in m ? m.lastWorkingDay : undefined,
}));

export const HOLIDAYS = [
  '23/01/2026',
  '24/01/2026',
  '25/01/2026',
  '26/01/2026',
  '27/01/2026',
  '31/08/2026',
  '01/09/2026',
  '02/09/2026',
]

export const USER_HOLIDAYS: Record<User['name'], string[]> = {
  'Nam': ['20/05/2026'],
  'Long': [],
}

export const BASE_URL = 'https://d14znnyip8zkld.cloudfront.net';
export const API_URL = `${BASE_URL}/api/check_in_out/reg`;
export const LOGIN_URL = `${BASE_URL}/api/login`;
export const TIMEZONE = 'Asia/Ho_Chi_Minh';
export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';
