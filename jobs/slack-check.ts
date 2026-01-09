/**
 * Slack check-in script
 * Runs at 8:45 AM GMT+7 on Wed and Thu
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { SLACK_USERS, TIMEZONE } from './constants.js';
import type { SlackUser } from './types.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const SLACK_API_URL = 'https://andpadvietnam.slack.com/api/views.submit';
const VIEW_ID = 'V0A7S888TUJ';

function buildFormData(token: string, date: string, message: string): { body: string; boundary: string } {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const state = JSON.stringify({
    values: {
      BwtY: {
        '47731a1a-3b36-4e26-9e87-8c8518d8a153': {
          type: 'datepicker',
          selected_date: date,
        },
      },
      BJQEj: {
        'c1b8fe86-84b8-42d7-a069-4904c6c8dbe7': {
          type: 'plain_text_input',
          value: message,
        },
      },
    },
  });

  const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}`,
    `--${boundary}\r\nContent-Disposition: form-data; name="client_token"\r\n\r\nweb-${Date.now()}`,
    `--${boundary}\r\nContent-Disposition: form-data; name="view_id"\r\n\r\n${VIEW_ID}`,
    `--${boundary}\r\nContent-Disposition: form-data; name="state"\r\n\r\n${state}`,
    `--${boundary}\r\nContent-Disposition: form-data; name="_x_reason"\r\n\r\nsubmit-view`,
    `--${boundary}\r\nContent-Disposition: form-data; name="_x_mode"\r\n\r\nonline`,
    `--${boundary}\r\nContent-Disposition: form-data; name="_x_sonic"\r\n\r\ntrue`,
    `--${boundary}\r\nContent-Disposition: form-data; name="_x_app_name"\r\n\r\nclient`,
    `--${boundary}--\r\n`,
  ];

  return { body: parts.join('\r\n'), boundary };
}

async function checkSlack(user: SlackUser): Promise<void> {
  const now = dayjs().tz(TIMEZONE);
  const date = now.format('YYYY-MM-DD');
  const message = 'work';

  console.log(`\n👤 ${user.name} (Slack)`);
  console.log('📅 Date:', date);

  const { body, boundary } = buildFormData(user.token, date, message);

  const response = await fetch(SLACK_API_URL, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'cookie': user.cookie,
      'origin': 'https://app.slack.com',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    },
    body,
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(`Slack check-in failed for ${user.name}: ${JSON.stringify(result)}`);
  }

  console.log('✅ Slack check-in successful');
}

async function main(): Promise<void> {
  const now = dayjs().tz(TIMEZONE);
  console.log('🕐 Current time (GMT+7):', now.format('YYYY-MM-DD HH:mm:ss'));
  console.log(`💬 Slack check-in: ${SLACK_USERS.length} user(s)`);

  for (const user of SLACK_USERS) {
    await checkSlack(user);
  }

  console.log(`\n✅ All done!`);
}

main().catch((error: unknown) => {
  console.error('❌ Job failed:', error);
  process.exit(1);
});

