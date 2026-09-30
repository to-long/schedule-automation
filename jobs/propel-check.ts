/**
 * Propel check-in/check-out script
 * Auto-detects action based on GMT+7 time:
 *   - Before 9AM: check-in
 *   - After 6PM: check-out
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { USERS, API_URL, TIMEZONE, HOLIDAYS, USER_HOLIDAYS } from './constants.js';
import { login, headers } from './auth.js';
import type { User, ActionType } from './types.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

function detectAction(): ActionType {
  const hour = dayjs().tz(TIMEZONE).hour();
  return hour >= 18 ? 'out' : 'in';
}

function postCheck(token: string, payload: object): Promise<Response> {
  return fetch(API_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

async function checkPropel(user: User, action: ActionType): Promise<void> {
  const now = dayjs().tz(TIMEZONE);
  const payload = {
    typeOfButton: action === 'in' ? 1 : 2,
    dateToHitAButton: now.format('YYYY-MM-DD HH:mm:ss'),
    longtitude: user.lng,
    latitude: user.lat,
    isAllowWrong: true,
  };

  console.log(`\n👤 ${user.name}`);
  console.log('📍 Location:', { lat: user.lat, lng: user.lng });
  console.log('🕐 Timestamp:', payload.dateToHitAButton);

  let response = await postCheck(user.token, payload);

  // Token in constants died → mint a fresh one via /login with secret credentials, retry once.
  if (response.status === 401) {
    if (!user.email || !user.password) {
      throw new Error(`Token dead for ${user.name} (401) and no credentials to re-login`);
    }
    console.log('🔑 Token chết (401) — đăng nhập lại bằng credential...');
    const freshToken = await login(user);
    response = await postCheck(freshToken, payload);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Check-${action} failed for ${user.name}: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Check-${action} successful:`, JSON.stringify(result, null, 2));
}

async function main(): Promise<void> {
  const now = dayjs().tz(TIMEZONE);
  
  const todayStr = now.format('DD/MM/YYYY');
  if (HOLIDAYS.includes(todayStr)) {
    console.log(`🏖️ ${todayStr} is a holiday. Skipping check-in/out.`);
    process.exit(0);
  }
  console.log('🕐 Current time (GMT+7):', now.format('YYYY-MM-DD HH:mm:ss'));
  
  const action = detectAction();
  console.log(`🚀 Action: check-${action}`);
  console.log(`👥 Processing ${USERS.length} user(s)...`);

  let successCount = 0;
  let failCount = 0;

  for (const user of USERS) {
    if (user.lastWorkingDay && now.isAfter(dayjs.tz(user.lastWorkingDay, 'DD/MM/YYYY', TIMEZONE), 'day')) {
      console.log(`\n🚪 ${user.name}'s last working day was ${user.lastWorkingDay}. Skipping.`);
      continue;
    }
    const userHolidays = USER_HOLIDAYS[user.name] ?? [];
    if (userHolidays.includes(todayStr)) {
      console.log(`\n🏖️ ${user.name} is on personal leave today (${todayStr}). Skipping.`);
      continue;
    }
    try {
      await checkPropel(user, action);
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`❌ Failed for ${user.name}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed`);
  
  if (failCount > 0) {
    process.exit(1);
  }
  
  console.log(`✅ All done!`);
}

main().catch((error: unknown) => {
  console.error('❌ Job failed:', error);
  process.exit(1);
});
