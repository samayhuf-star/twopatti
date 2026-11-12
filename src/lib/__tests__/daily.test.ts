import { localDay, nextDaily } from '../daily';

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe('daily bonus: 2,000 a day, rising to 5,000 on a 7-day streak', () => {
  test('first claim pays 2,000', () => {
    expect(nextDaily(null, 0, at(2026, 11, 12))).toMatchObject({ available: true, streak: 1, amount: 2000 });
  });
  test('consecutive days rise by 500 to 5,000 on day 7, then stay at 5,000', () => {
    let last: string | null = null;
    let streak = 0;
    const paid: number[] = [];
    for (let d = 1; d <= 9; d++) {
      const r = nextDaily(last, streak, at(2026, 11, d));
      paid.push(r.amount);
      last = r.today;
      streak = r.streak;
    }
    expect(paid).toEqual([2000, 2500, 3000, 3500, 4000, 4500, 5000, 5000, 5000]);
  });
  test('only once per local day', () => {
    const now = at(2026, 11, 12);
    expect(nextDaily(localDay(now), 3, now)).toMatchObject({ available: false, amount: 0 });
  });
  test('a missed day resets the streak to 2,000', () => {
    expect(nextDaily(localDay(at(2026, 11, 10)), 5, at(2026, 11, 12))).toMatchObject({ streak: 1, amount: 2000 });
  });
});
