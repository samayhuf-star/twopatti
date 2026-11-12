import { DAILY_BONUS } from './config';

export function localDay(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Daily bonus of 250 chips, once per local day. No streak. */
export function nextDaily(lastDay: string | null, now = new Date()) {
  const today = localDay(now);
  if (lastDay === today) return { available: false, amount: 0, today };
  return { available: true, amount: DAILY_BONUS, today };
}
