import { Card, Rng, fullDeck, shuffle } from './cards';
import {
  Completion,
  DEFAULT_IMAGINARY_COMPLETION,
  ImaginaryCompletion,
  MadeHand,
  bestImaginary,
  compareShowdown,
  evaluateThree,
} from './hand';

export type Mode = 'centre' | 'imaginary';

export interface TableConfig {
  mode: Mode;
  ante: number;
  /** Max current blind while a player is still blind (8x the ante). */
  blindCap: number;
  /** Pot cap and max single bet (128x ante). Reaching it forces a showdown. */
  potCap: number;
  /** Max own actions while blind; the next action forces a free see. */
  maxBlindActions: number;
  imaginaryCompletion: ImaginaryCompletion;
  /** House bonus for a still-blind winner, as a fraction of the pot. */
  blindWinBonus: number;
}

export interface Tier {
  id: string;
  name: string;
  ante: number;
  blindCap: number;
  minToSit: number;
  potCap: number;
}

export const TIERS: Tier[] = [
  { id: 'silver', name: 'Silver', ante: 100 },
  { id: 'gold', name: 'Gold', ante: 500 },
  { id: 'plat1', name: 'Platinum', ante: 1000 },
  { id: 'plat2', name: 'Platinum', ante: 2000 },
  { id: 'diamond', name: 'Diamond', ante: 5000 },
  { id: 'royal', name: 'Royal', ante: 10000 },
].map(t => ({
  ...t,
  blindCap: t.ante * 8,
  // A fresh wallet is 25,000. Diamond's buy-in matches that stack so it can be sat.
  // Ante, blind cap (8× ante) and pot cap (128× ante) stay on the same multiples.
  minToSit: t.id === 'diamond' ? 25_000 : t.ante * 10,
  potCap: t.ante * 128,
}));

export const SILVER = TIERS[0];

export function tableConfig(mode: Mode, tier: Tier = SILVER, overrides: Partial<TableConfig> = {}): TableConfig {
  return {
    mode,
    ante: tier.ante,
    blindCap: tier.blindCap,
    potCap: tier.potCap,
    maxBlindActions: 4,
    imaginaryCompletion: DEFAULT_IMAGINARY_COMPLETION,
    blindWinBonus: 0.1,
    ...overrides,
  };
}

export interface SeatInput {
  id: string;
  name: string;
  isBot: boolean;
  chips: number;
}

export interface PlayerState extends SeatInput {
  hole: Card[];
  seen: boolean;
  folded: boolean;
  /** Own actions taken while still blind this hand. */
  blindActions: number;
  /** Chips put into the pot this hand. */
  totalIn: number;
  /** Chips at the start of the hand, before the ante. */
  startChips: number;
}

export type Phase = 'betting' | 'complete';

export type Action =
  | { type: 'see' }
  | { type: 'fold' }
  | { type: 'bet'; raise: boolean }
  | { type: 'show' };

export type LogEvent =
  | { type: 'ante'; playerId: string; amount: number }
  | { type: 'see'; playerId: string; forced: boolean }
  | { type: 'bet'; playerId: string; amount: number; raise: boolean; blind: boolean }
  | { type: 'fold'; playerId: string }
  | { type: 'show'; playerId: string; amount: number }
  | { type: 'centre'; card: Card }
  | { type: 'potCap' }
  | { type: 'win'; playerId: string; pot: number; bonus: number; reason: WinReason };

export type WinReason = 'lastStanding' | 'show' | 'potCap';

export interface ShownHand {
  playerId: string;
  made: MadeHand;
  /** Third card used: centre card or imaginary completion. */
  third: Card;
  imaginary: boolean;
}

export interface HandResult {
  winnerId: string;
  pot: number;
  /** House Blind Win bonus, credited separately and never taken from the pot. */
  bonus: number;
  reason: WinReason;
  shown: ShownHand[];
}

export interface GameState {
  config: TableConfig;
  players: PlayerState[];
  dealer: number;
  turn: number;
  pot: number;
  /** Current blind unit; always an ante multiple. */
  currentBlind: number;
  phase: Phase;
  /** Centre mode: 1 before the centre opens, 2 after. Imaginary mode stays 1. */
  round: 1 | 2;
  centre: Card | null;
  centreOpen: boolean;
  /** Player ids that have acted in the first betting round. */
  actedRound1: string[];
  log: LogEvent[];
  result: HandResult | null;
}

export function activePlayers(s: GameState): PlayerState[] {
  return s.players.filter(p => !p.folded);
}

function nextActiveIndex(s: GameState, from: number): number {
  const n = s.players.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    if (!s.players[i].folded) return i;
  }
  return from;
}

/** Start a hand: everyone posts the ante, then two hole cards each (and a face-down centre in Centre mode). */
export function startHand(config: TableConfig, seats: SeatInput[], dealer: number, rng: Rng): GameState {
  if (seats.length < 4 || seats.length > 5) throw new Error('Tables are 4 or 5 seats only');
  const deck = shuffle(fullDeck(), rng);
  const players: PlayerState[] = seats.map(seat => ({
    ...seat,
    hole: [],
    seen: false,
    folded: false,
    blindActions: 0,
    totalIn: 0,
    startChips: seat.chips,
  }));
  const log: LogEvent[] = [];
  let pot = 0;
  for (const p of players) {
    if (p.chips < config.ante) throw new Error(`${p.name} cannot cover the ante`);
    p.chips -= config.ante;
    p.totalIn += config.ante;
    pot += config.ante;
    log.push({ type: 'ante', playerId: p.id, amount: config.ante });
  }
  const n = players.length;
  // Deal one card at a time starting left of the dealer.
  for (let round = 0; round < 2; round++) {
    for (let k = 1; k <= n; k++) players[(dealer + k) % n].hole.push(deck.pop()!);
  }
  const centre = config.mode === 'centre' ? deck.pop()! : null;
  const s: GameState = {
    config,
    players,
    dealer,
    turn: (dealer + 1) % n,
    pot,
    currentBlind: config.ante,
    phase: 'betting',
    round: 1,
    centre,
    centreOpen: false,
    actedRound1: [],
    log,
    result: null,
  };
  applyForcedSee(s);
  return s;
}

export interface BetOption {
  amount: number;
  raise: boolean;
}

export interface LegalActions {
  canSee: boolean;
  /** True when the player must see before acting (blind round limit or blind cap). */
  mustSee: boolean;
  canFold: boolean;
  bets: BetOption[];
  show: { amount: number } | null;
}

function maxSingleBet(s: GameState): number {
  return s.config.potCap;
}

/**
 * Legal options for the player whose turn it is. Every amount is an ante multiple.
 * A raise is offered only if it stays within the pot, the blind cap (blind players) and the
 * 128x-ante pot cap; otherwise only the lower option is offered. A call that reaches the
 * pot cap ends betting and forces a showdown.
 */
export function legalActions(s: GameState, playerIndex = s.turn): LegalActions {
  const none: LegalActions = { canSee: false, mustSee: false, canFold: false, bets: [], show: null };
  if (s.phase !== 'betting' || playerIndex !== s.turn) return none;
  const p = s.players[playerIndex];
  if (p.folded) return none;
  const { ante, blindCap } = s.config;
  const B = s.currentBlind;
  const heads = activePlayers(s).length === 2;
  const bets: BetOption[] = [];
  let mustSee = false;
  if (!p.seen) {
    if (p.blindActions >= s.config.maxBlindActions || B > blindCap) {
      mustSee = true;
    } else {
      if (B <= p.chips) bets.push({ amount: B, raise: false });
      const r = 2 * B;
      if (r <= blindCap && r <= s.pot && r <= maxSingleBet(s) && s.pot + r <= s.config.potCap && r <= p.chips) bets.push({ amount: r, raise: true });
    }
  } else {
    const call = 2 * B;
    if (call <= p.chips && call <= maxSingleBet(s)) bets.push({ amount: call, raise: false });
    const r = 4 * B;
    if (r <= s.pot && r <= maxSingleBet(s) && s.pot + r <= s.config.potCap && r <= p.chips) bets.push({ amount: r, raise: true });
  }
  let show: { amount: number } | null = null;
  if (heads && !mustSee) {
    const amount = p.seen ? 2 * B : B;
    if (amount <= p.chips) show = { amount };
  }
  for (const b of bets) if (b.amount % ante !== 0) throw new Error('Engine produced a non-ante-multiple bet');
  return { canSee: !p.seen, mustSee, canFold: true, bets, show };
}

function applyForcedSee(s: GameState) {
  if (s.phase !== 'betting') return;
  const p = s.players[s.turn];
  if (!p.seen && p.blindActions >= s.config.maxBlindActions) {
    p.seen = true;
    s.log.push({ type: 'see', playerId: p.id, forced: true });
  }
}

/** Hand used at show and showdown: hole plus open centre, or hole plus the imaginary completion. */
export function handFor(s: GameState, p: PlayerState): ShownHand {
  if (s.config.mode === 'centre') {
    if (!s.centre) throw new Error('Centre card missing');
    return { playerId: p.id, made: evaluateThree([...p.hole, s.centre]), third: s.centre, imaginary: false };
  }
  const others = s.players.filter(o => o.id !== p.id).flatMap(o => o.hole);
  const c: Completion = bestImaginary(p.hole, s.config.imaginaryCompletion, others);
  return { playerId: p.id, made: c.made, third: c.card, imaginary: true };
}

function openCentre(s: GameState) {
  if (s.config.mode === 'centre' && !s.centreOpen && s.centre) {
    s.centreOpen = true;
    s.log.push({ type: 'centre', card: s.centre });
  }
}

function award(s: GameState, winner: PlayerState, reason: WinReason, shown: ShownHand[]) {
  const pot = s.pot;
  winner.chips += pot;
  let bonus = 0;
  if (!winner.seen) {
    bonus = Math.max(1, Math.floor(pot * s.config.blindWinBonus));
    winner.chips += bonus;
  }
  s.pot = 0;
  s.phase = 'complete';
  s.result = { winnerId: winner.id, pot, bonus, reason, shown };
  s.log.push({ type: 'win', playerId: winner.id, pot, bonus, reason });
}

function showdown(s: GameState, contenders: PlayerState[], reason: WinReason) {
  openCentre(s);
  const shown = contenders.map(p => handFor(s, p));
  let best = 0;
  for (let i = 1; i < contenders.length; i++) {
    const c = compareShowdown(
      { made: shown[i].made, hole: contenders[i].hole },
      { made: shown[best].made, hole: contenders[best].hole },
    );
    if (c > 0) best = i;
  }
  award(s, contenders[best], reason, shown);
}

function pay(s: GameState, p: PlayerState, amount: number) {
  if (amount > p.chips) throw new Error('Not enough chips');
  p.chips -= amount;
  p.totalIn += amount;
  s.pot += amount;
}

function advance(s: GameState) {
  const actor = s.players[s.turn];
  const active = activePlayers(s);
  if (active.length === 1) {
    award(s, active[0], 'lastStanding', []);
    return;
  }
  if (s.pot >= s.config.potCap) {
    s.log.push({ type: 'potCap' });
    showdown(s, active, 'potCap');
    return;
  }
  if (s.round === 1 && s.config.mode === 'centre') {
    if (!s.actedRound1.includes(actor.id)) s.actedRound1.push(actor.id);
    const roundDone = active.every(p => s.actedRound1.includes(p.id));
    if (roundDone) {
      openCentre(s);
      s.round = 2;
      // Second round starts with the first still-active player left of the dealer.
      s.turn = nextActiveIndex(s, s.dealer);
      applyForcedSee(s);
      return;
    }
  }
  s.turn = nextActiveIndex(s, s.turn);
  applyForcedSee(s);
}

/** Apply an action for the player whose turn it is. Returns a new state; the input is not mutated. */
export function act(prev: GameState, action: Action): GameState {
  if (prev.phase !== 'betting') throw new Error('Hand is over');
  const s: GameState = structuredCloneState(prev);
  const p = s.players[s.turn];
  const legal = legalActions(s);
  switch (action.type) {
    case 'see': {
      if (!legal.canSee) throw new Error('Already seen');
      p.seen = true;
      s.log.push({ type: 'see', playerId: p.id, forced: false });
      return s; // Seeing is free and does not end the turn.
    }
    case 'fold': {
      p.folded = true;
      s.log.push({ type: 'fold', playerId: p.id });
      advance(s);
      return s;
    }
    case 'bet': {
      const opt = legal.bets.find(b => b.raise === action.raise);
      if (!opt) throw new Error(action.raise ? 'Raise not allowed' : 'Bet not allowed');
      const wasBlind = !p.seen;
      pay(s, p, opt.amount);
      if (wasBlind) p.blindActions += 1;
      if (action.raise) s.currentBlind = wasBlind ? opt.amount : opt.amount / 2;
      s.log.push({ type: 'bet', playerId: p.id, amount: opt.amount, raise: action.raise, blind: wasBlind });
      advance(s);
      return s;
    }
    case 'show': {
      if (!legal.show) throw new Error('Show needs exactly two players left');
      const wasBlind = !p.seen;
      pay(s, p, legal.show.amount);
      if (wasBlind) p.blindActions += 1;
      s.log.push({ type: 'show', playerId: p.id, amount: legal.show.amount });
      showdown(s, activePlayers(s), 'show');
      return s;
    }
  }
}

function structuredCloneState(s: GameState): GameState {
  return {
    ...s,
    players: s.players.map(p => ({ ...p, hole: p.hole.slice() })),
    actedRound1: s.actedRound1.slice(),
    log: s.log.slice(),
    result: s.result,
  };
}

/** Sum of every chip at the table plus the pot. Used by tests to prove chips are conserved. */
export function chipsInPlay(s: GameState): number {
  return s.pot + s.players.reduce((a, p) => a + p.chips, 0);
}

/** Seeing is allowed at any time, on your turn or between actions, and costs nothing. */
export function seeCards(prev: GameState, playerIndex: number): GameState {
  const p0 = prev.players[playerIndex];
  if (prev.phase !== 'betting' || !p0 || p0.seen || p0.folded) return prev;
  const s = structuredCloneState(prev);
  s.players[playerIndex].seen = true;
  s.log.push({ type: 'see', playerId: p0.id, forced: false });
  return s;
}
