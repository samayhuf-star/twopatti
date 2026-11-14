// Pot chip-stack layout for the table. Pure, no React imports.

/** Stack positions around the centre of the pile, front stacks last so they draw on top. */
export const SPOTS = [
  { x: 0, y: 0 },
  { x: -24, y: -6 },
  { x: 24, y: -6 },
  { x: -12, y: -16 },
  { x: 12, y: -16 },
  { x: -36, y: 8 },
  { x: 36, y: 8 },
  { x: 0, y: -26 },
  { x: -14, y: 12 },
  { x: 14, y: 12 },
];
export const MAX_STACK = 7;

/** Splits a pot into chip stacks. Pure, so it can be unit tested. */
export function potStacks(amount: number, ante: number): number[] {
  if (amount <= 0) return [];
  const chips = Math.min(SPOTS.length * MAX_STACK, Math.max(1, Math.round(amount / Math.max(1, ante / 2))));
  const stacks = Math.min(SPOTS.length, Math.max(1, Math.ceil(chips / 3)));
  const out = Array.from({ length: stacks }, () => 0);
  for (let i = 0; i < chips; i++) out[i % stacks] = Math.min(MAX_STACK, out[i % stacks] + 1);
  return out;
}

