import { MAX_STACK, SPOTS, potStacks } from '../pot';

describe('pot chip stacks', () => {
  test('empty pot shows no chips', () => {
    expect(potStacks(0, 100)).toEqual([]);
  });
  test('stacks grow with the pot', () => {
    const total = (a: number) => potStacks(a, 100).reduce((x, y) => x + y, 0);
    expect(total(500)).toBeLessThan(total(2000));
    expect(potStacks(2000, 100).length).toBeGreaterThan(potStacks(500, 100).length);
  });
  test('never exceeds the drawn spots or stack height', () => {
    const s = potStacks(12_800, 100);
    expect(s.length).toBeLessThanOrEqual(SPOTS.length);
    expect(Math.max(...s)).toBeLessThanOrEqual(MAX_STACK);
  });
});
