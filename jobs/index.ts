/**
 * Scheduled check-in/check-out script
 * Auto-detects action based on GMT+7 time:
 *   - Before 9AM: check-in
 *   - After 6PM: check-out
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { USERS, TIMEZONE } from './constants.js';
import { checkPropel } from './propel-check.js';
import type { ActionType } from './types.js';

dayjs.extend(utc);
dayjs.extend(timezone);

function detectAction(): ActionType {
  const hour = dayjs().tz(TIMEZONE).hour();
  
  if (hour < 9) return 'in';
  if (hour >= 18) return 'out';
  
  throw new Error(`Invalid time: ${hour}:00 GMT+7. Must be before 9AM or after 6PM.`);
}

async function main(): Promise<void> {
  const now = dayjs().tz(TIMEZONE);
  console.log('🕐 Current time (GMT+7):', now.format('YYYY-MM-DD HH:mm:ss'));
  
  const action = detectAction();
  console.log(`🚀 Action: check-${action}`);
  console.log(`👥 Processing ${USERS.length} user(s)...`);

  for (const user of USERS) {
    await checkPropel(user, action);
  }

  console.log(`\n✅ All done!`);
}

main().catch((error: unknown) => {
  console.error('❌ Job failed:', error);
  process.exit(1);
});
