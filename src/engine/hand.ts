import { Card, SUIT_ORDER, rankLabel, sameCard, fullDeck } from './cards';

/** Higher is better. */
export enum Category {
  HighCard = 0,
  Pair = 1,
  Flush = 2,
  Straight = 3,
  StraightFlush = 4,
  ThreeOfAKind = 5,
}

export const CATEGORY_NAME: Record<Category, string> = {
  [Category.HighCard]: 'High Card',
  [Category.Pair]: 'Pair',
  [Category.Flush]: 'Flush',
  [Category.Straight]: 'Straight',
  [Category.StraightFlush]: 'Straight Flush',
  [Category.ThreeOfAKind]: 'Three of a Kind',
};

export interface MadeHand {
  category: Category;
  /** Within-category comparison key, compared left to right. */
  key: number[];
  /** Ranks of the three cards, high to low (A-2-3 listed as A, 3, 2). */
  ranks: number[];
}

/** Value used for the A-2-3 straight, which ranks above A-K-Q (14). */
export const WHEEL_STRAIGHT_VALUE = 15;

/**
 * Straight value for three distinct ranks, or 0 if not a straight.
 * A-2-3 is the highest straight (15), then A-K-Q (14), K-Q-J (13) down to 4-3-2 (4).
 * No wrap-around such as K-A-2.
 */
export function straightValue(ranks: number[]): number {
  const r = ranks.slice().sort((a, b) => b - a);
  if (r[0] === 14 && r[1] === 3 && r[2] === 2) return WHEEL_STRAIGHT_VALUE;
  if (r[0] - 1 === r[1] && r[1] - 1 === r[2]) return r[0];
  return 0;
}

/** Score a three-rank hand. `suited` is true when all three cards share a suit. */
export function scoreRanks(ranksIn: number[], suited: boolean): MadeHand {
  if (ranksIn.length !== 3) throw new Error('A hand has exactly three cards');
  const ranks = ranksIn.slice().sort((a, b) => b - a);
  const [a, b, c] = ranks;
  if (a === b && b === c) return { category: Category.ThreeOfAKind, key: [a], ranks };
  const sv = a !== b && b !== c ? straightValue(ranks) : 0;
  if (sv && suited) return { category: Category.StraightFlush, key: [sv], ranks };
  if (sv) return { category: Category.Straight, key: [sv], ranks };
  if (suited) return { category: Category.Flush, key: ranks, ranks };
  if (a === b) return { category: Category.Pair, key: [a, c], ranks };
  if (b === c) return { category: Category.Pair, key: [b, a], ranks };
  return { category: Category.HighCard, key: ranks, ranks };
}

export function evaluateThree(cards: Card[]): MadeHand {
  if (cards.length !== 3) throw new Error('A hand has exactly three cards');
  const suited = cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
  return scoreRanks(cards.map(c => c.rank), suited);
}

/** Compare made hands only (category, then within-category order). >0 means a is better. */
export function compareMade(a: MadeHand, b: MadeHand): number {
  if (a.category !== b.category) return a.category - b.category;
  const n = Math.max(a.key.length, b.key.length);
  for (let i = 0; i < n; i++) {
    const d = (a.key[i] ?? 0) - (b.key[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * Suit tie-break key from a player's own two real hole cards (section 5):
 * sort by rank (Ace high); for a pair, the better suit first. Compare suits in that order.
 */
export function holeSuitKey(hole: Card[]): number[] {
  const s = hole.slice().sort((x, y) => y.rank - x.rank || SUIT_ORDER[y.suit] - SUIT_ORDER[x.suit]);
  return s.map(c => SUIT_ORDER[c.suit]);
}

function holeRankKey(hole: Card[]): number[] {
  return hole.map(c => c.rank).sort((x, y) => y - x);
}

/**
 * Full comparison with tie-breaks so there is always exactly one winner.
 * 1. Made hand. 2. Suits of the real hole cards (S > H > D > C).
 * 3. Fallback, only reachable in Imaginary mode when two different hole pairs make the same hand
 *    with identical suit patterns (for example A\u2660 3\u2665 vs 3\u2660 2\u2665, both A-2-3):
 *    the higher real hole-card rank wins. Two different hands can never tie past this step.
 */
export function compareShowdown(a: { made: MadeHand; hole: Card[] }, b: { made: MadeHand; hole: Card[] }): number {
  const m = compareMade(a.made, b.made);
  if (m !== 0) return m;
  const sa = holeSuitKey(a.hole);
  const sb = holeSuitKey(b.hole);
  for (let i = 0; i < 2; i++) if (sa[i] !== sb[i]) return sa[i] - sb[i];
  const ra = holeRankKey(a.hole);
  const rb = holeRankKey(b.hole);
  for (let i = 0; i < 2; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
  return 0;
}

export function describeMade(m: MadeHand): string {
  const name = CATEGORY_NAME[m.category];
  switch (m.category) {
    case Category.ThreeOfAKind:
      return `${name}, ${rankLabel(m.key[0])}s`;
    case Category.Pair:
      return `Pair of ${rankLabel(m.key[0])}s`;
    case Category.Straight:
    case Category.StraightFlush:
      return m.key[0] === WHEEL_STRAIGHT_VALUE ? `${name} A-2-3` : `${name} ${m.ranks.map(rankLabel).join('-')}`;
    default:
      return `${name} ${m.ranks.map(rankLabel).join('-')}`;
  }
}

/**
 * Imaginary completion rule (Q5). Locked by Samay on 12 Nov 2026: 'independent'.
 * - independent: the best card from the player's own two cards, even if another player holds it.
 *   It can never duplicate a card the player already holds.
 * - remainingDeck: stricter alternative, kept for a possible future switch and covered by tests.
 *   The card must not be held by anyone at the table (pass every other dealt card in `excluded`).
 */
export type ImaginaryCompletion = 'independent' | 'remainingDeck';
export const DEFAULT_IMAGINARY_COMPLETION: ImaginaryCompletion = 'independent';

export interface Completion {
  made: MadeHand;
  /** The card shown on the felt. It never breaks a tie and its suit is ignored. */
  card: Card;
}

/**
 * Best imaginary third card for two real hole cards. Tries every candidate card
 * (50 for 'independent'), scores each with the section 3 ranking and keeps the maximum.
 * When several cards make the same hand, the first in fixed deck order (Spades, Ace high first)
 * is shown so the felt is stable.
 */
export function bestImaginary(
  hole: Card[],
  rule: ImaginaryCompletion = DEFAULT_IMAGINARY_COMPLETION,
  excluded: Card[] = [],
): Completion {
  if (hole.length !== 2) throw new Error('Imaginary completion needs exactly two hole cards');
  const blocked = rule === 'remainingDeck' ? hole.concat(excluded) : hole;
  let best: Completion | null = null;
  for (const card of fullDeck()) {
    if (blocked.some(b => sameCard(b, card))) continue;
    const made = evaluateThree([hole[0], hole[1], card]);
    if (!best || compareMade(made, best.made) > 0) best = { made, card };
  }
  if (!best) throw new Error('No imaginary card available');
  return best;
}

/** Strength of two hole cards before any third card is known (used by bots in Centre mode). */
export function preflopStrength(hole: Card[]): number {
  const [hi, lo] = hole.map(c => c.rank).sort((a, b) => b - a);
  let s = (hi + lo) / 28; // 0.14 .. 1
  if (hi === lo) s += 0.5 + hi / 40;
  if (hole[0].suit === hole[1].suit) s += 0.12;
  const gap = hi - lo;
  if (gap === 1 || gap === 2 || (hi === 14 && lo <= 3)) s += 0.1;
  return Math.min(1.5, s);
}

