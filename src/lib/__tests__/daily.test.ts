import { localDay, nextDaily } from '../daily';

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe('daily bonus: flat 250 chips once per local day', () => {
  test('first claim pays 250', () => {
    expect(nextDaily(null, at(2026, 11, 12))).toMatchObject({ available: true, amount: 250 });
  });
  test('consecutive days still pay 250', () => {
    let last: string | null = null;
    const paid: number[] = [];
    for (let d = 1; d <= 9; d++) {
      const r = nextDaily(last, at(2026, 11, d));
      paid.push(r.amount);
      last = r.today;
    }
    expect(paid).toEqual([250, 250, 250, 250, 250, 250, 250, 250, 250]);
  });
  test('only once per local day', () => {
    const now = at(2026, 11, 12);
    expect(nextDaily(localDay(now), now)).toMatchObject({ available: false, amount: 0 });
  });
  test('a missed day still pays 250', () => {
    expect(nextDaily(localDay(at(2026, 11, 10)), at(2026, 11, 12))).toMatchObject({ available: true, amount: 250 });
  });
});
