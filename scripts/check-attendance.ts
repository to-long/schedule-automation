/**
 * Scheduled check-in/check-out script
 * Auto-detects action based on GMT+7 time:
 *   - Before 9AM: check-in
 *   - After 6PM: check-out
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { USERS, API_URL, TIMEZONE, type User } from './constants.js';

dayjs.extend(utc);
dayjs.extend(timezone);

type ActionType = 'in' | 'out';

function detectAction(): ActionType {
  const hour = dayjs().tz(TIMEZONE).hour();
  
  if (hour < 9) return 'in';
  if (hour >= 18) return 'out';
  
  throw new Error(`Invalid time: ${hour}:00 GMT+7. Must be before 9AM or after 6PM.`);
}

async function checkAttendance(user: User, action: ActionType): Promise<void> {
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

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'authorization': `Bearer ${user.token}`,
      'content-type': 'application/json',
      'origin': 'https://propel.vn',
      'referer': 'https://propel.vn/',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Check-${action} failed for ${user.name}: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Check-${action} successful:`, JSON.stringify(result, null, 2));
}

async function main(): Promise<void> {
  const now = dayjs().tz(TIMEZONE);
  console.log('🕐 Current time (GMT+7):', now.format('YYYY-MM-DD HH:mm:ss'));
  
  const action = detectAction();
  console.log(`🚀 Action: check-${action}`);
  console.log(`👥 Processing ${USERS.length} user(s)...`);

  for (const user of USERS) {
    await checkAttendance(user, action);
  }

  console.log(`\n✅ All done!`);
}

main().catch((error: unknown) => {
  console.error('❌ Job failed:', error);
  process.exit(1);
});
