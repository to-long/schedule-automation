/**
 * Scheduled check-in/check-out script
 * Usage: tsx scripts/check-attendance.ts [in|out]
 *   - in:  check-in (typeOfButton = 1)
 *   - out: check-out (typeOfButton = 2)
 */

import 'dotenv/config';

const API_URL = process.env.API_URL!;
const LONGITUDE = parseFloat(process.env.LONGITUDE!);
const LATITUDE = parseFloat(process.env.LATITUDE!);

type ActionType = 'in' | 'out';

const TYPE_MAP: Record<ActionType, number> = {
  in: 1,
  out: 2,
};

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function checkInOut(action: ActionType): Promise<void> {
  const token = process.env.AUTH_TOKEN;
  
  if (!token) {
    throw new Error('AUTH_TOKEN environment variable is required');
  }

  const typeOfButton = TYPE_MAP[action];
  const now = new Date();
  const dateToHitAButton = formatDateTime(now);

  const payload = {
    typeOfButton,
    dateToHitAButton,
    longtitude: LONGITUDE, // Note: API uses "longtitude" (typo in their API)
    latitude: LATITUDE,
    isAllowWrong: true,
  };

  console.log('📍 Location:', { longitude: LONGITUDE, latitude: LATITUDE });
  console.log('🕐 Timestamp:', dateToHitAButton);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json',
      'origin': 'https://propel.vn',
      'referer': 'https://propel.vn/',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Check-${action} failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Check-${action} successful:`, JSON.stringify(result, null, 2));
}

async function main(): Promise<void> {
  const action = process.argv[2] as ActionType;
  
  if (!action || !['in', 'out'].includes(action)) {
    console.error('Usage: tsx scripts/check-attendance.ts [in|out]');
    process.exit(1);
  }

  console.log(`🚀 Check-${action} job started at:`, new Date().toISOString());
  
  await checkInOut(action);
  
  console.log(`✅ Check-${action} job completed`);
}

main().catch((error: unknown) => {
  console.error('❌ Job failed:', error);
  process.exit(1);
});

