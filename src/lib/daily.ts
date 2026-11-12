import { DAILY_BONUS_BASE, DAILY_BONUS_MAX_STREAK, DAILY_BONUS_STEP } from './config';

export function localDay(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function yesterday(d = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return localDay(y);
}

/** Daily bonus once per local day, with a short streak (2,000 up to 5,000 on day 7). */
export function nextDaily(lastDay: string | null, streak: number, now = new Date()) {
  const today = localDay(now);
  if (lastDay === today) return { available: false, streak, amount: 0, today };
  const nextStreak = lastDay === yesterday(now) ? Math.min(DAILY_BONUS_MAX_STREAK, streak + 1) : 1;
  return { available: true, streak: nextStreak, amount: DAILY_BONUS_BASE + (nextStreak - 1) * DAILY_BONUS_STEP, today };
}
