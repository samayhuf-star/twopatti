// Pure rules engine for 2 Patti. No React or Expo imports, so it can move to a server later.

export type Suit = 'S' | 'H' | 'D' | 'C';
/** 2..14, where 14 is the Ace. */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  rank: Rank;
  suit: Suit;
}

/** Suit order for tie-breaks: Spades > Hearts > Diamonds > Clubs. */
export const SUIT_ORDER: Record<Suit, number> = { S: 4, H: 3, D: 2, C: 1 };
export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const RANKS: Rank[] = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

const RANK_LABEL: Record<number, string> = { 14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: '10' };
export const SUIT_SYMBOL: Record<Suit, string> = { S: '\u2660', H: '\u2665', D: '\u2666', C: '\u2663' };

export function rankLabel(rank: number): string {
  return RANK_LABEL[rank] ?? String(rank);
}

export function cardId(c: Card): string {
  return `${rankLabel(c.rank)}${c.suit}`;
}

export function cardLabel(c: Card): string {
  return `${rankLabel(c.rank)}${SUIT_SYMBOL[c.suit]}`;
}

export function sameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

/** Parse a short id like "AS", "10H", "7c". Throws on bad input. */
export function parseCard(id: string): Card {
  const m = /^(10|[2-9JQKA])([SHDC])$/i.exec(id.trim());
  if (!m) throw new Error(`Bad card id: ${id}`);
  const r = m[1].toUpperCase();
  const map: Record<string, Rank> = { A: 14, K: 13, Q: 12, J: 11 };
  const rank = (map[r] ?? Number(r)) as Rank;
  return { rank, suit: m[2].toUpperCase() as Suit };
}

export function parseCards(ids: string): Card[] {
  return ids.split(/\s+/).filter(Boolean).map(parseCard);
}

/** Standard 52-card deck in a fixed order (Spades first, Ace high first). */
export function fullDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  return deck;
}

export type Rng = () => number;

/** Small deterministic PRNG (mulberry32) so hands can be replayed in tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle, returns a new array. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
