import { parseCards, seededRng } from '../cards';
import { chooseBotAction } from '../bot';
import {
  GameState,
  SeatInput,
  SILVER,
  TIERS,
  act,
  activePlayers,
  chipsInPlay,
  legalActions,
  seeCards,
  startHand,
  tableConfig,
} from '../game';

const seats = (n: number, chips = 50_000): SeatInput[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: i === 0 ? 'You' : `Bot ${i}`, isBot: i > 0, chips }));

const start = (mode: 'centre' | 'imaginary' = 'imaginary', n = 4, seed = 1, chips = 50_000) =>
  startHand(tableConfig(mode), seats(n, chips), 0, seededRng(seed));

/** Replace hole cards for deterministic scenarios. */
function rig(s: GameState, holes: string[], centre?: string): GameState {
  s.players.forEach((p, i) => (p.hole = parseCards(holes[i])));
  if (centre) s.centre = parseCards(centre)[0];
  return s;
}

describe('table setup', () => {
  test('Silver tier: ante 100, blind cap 800, min 1,000, pot cap 12,800', () => {
    expect(SILVER).toMatchObject({ name: 'Silver', ante: 100, blindCap: 800, minToSit: 1000, potCap: 12800 });
    expect(TIERS.map(t => t.ante)).toEqual([100, 500, 1000, 2000, 5000, 10000]);
  });
  test('only 4 or 5 seats', () => {
    expect(() => start('imaginary', 3)).toThrow();
    expect(() => start('imaginary', 6)).toThrow();
    expect(start('imaginary', 4).players).toHaveLength(4);
    expect(start('imaginary', 5).players).toHaveLength(5);
  });
  test('everyone posts the ante, gets two cards, current blind starts at 1x ante', () => {
    const s = start('centre', 5);
    expect(s.pot).toBe(500);
    expect(s.players.every(p => p.hole.length === 2 && p.chips === 49_900)).toBe(true);
    expect(s.currentBlind).toBe(100);
    expect(s.centre).not.toBeNull();
    expect(s.centreOpen).toBe(false);
    expect(s.turn).toBe(1); // left of dealer 0
    const all = s.players.flatMap(p => p.hole).concat(s.centre!);
    expect(new Set(all.map(c => `${c.rank}${c.suit}`)).size).toBe(all.length);
  });
  test('imaginary mode has no centre card', () => {
    expect(start('imaginary').centre).toBeNull();
  });
});

describe('legal bet amounts', () => {
  test('blind player: current blind or double; seen player: 2x or 4x', () => {
    let s = start();
    expect(legalActions(s).bets).toEqual([
      { amount: 100, raise: false },
      { amount: 200, raise: true },
    ]);
    s = act(s, { type: 'see' });
    expect(s.turn).toBe(1); // seeing is free and keeps the turn
    expect(legalActions(s).bets).toEqual([
      { amount: 200, raise: false },
      { amount: 400, raise: true },
    ]);
  });
  test('blind raise sets the current blind to the blind amount; next seen player pays 400 or 800', () => {
    let s = start('imaginary', 4, 2);
    s = act(s, { type: 'bet', raise: true }); // blind 200
    expect(s.currentBlind).toBe(200);
    s = act(s, { type: 'see' });
    expect(legalActions(s).bets.map(b => b.amount)).toEqual([400]); // 800 is over the 600 pot
    s.pot = 2000;
    expect(legalActions(s).bets.map(b => b.amount)).toEqual([400, 800]);
  });
  test('seen raise: current blind becomes half of what the seen player put', () => {
    let s = start();
    s = act(s, { type: 'see' });
    s = act(s, { type: 'bet', raise: true }); // 400
    expect(s.currentBlind).toBe(200);
  });
  test('every amount is a multiple of the ante across a long random hand', () => {
    for (let seed = 1; seed <= 40; seed++) {
      let s = start(seed % 2 ? 'centre' : 'imaginary', 4 + (seed % 2), seed);
      const rng = seededRng(seed * 7);
      let guard = 0;
      while (s.phase === 'betting' && guard++ < 500) {
        const l = legalActions(s);
        for (const b of l.bets) expect(b.amount % 100).toBe(0);
        if (l.show) expect(l.show.amount % 100).toBe(0);
        s = act(s, chooseBotAction(s, 'medium', rng));
      }
      for (const e of s.log) if (e.type === 'bet' || e.type === 'show' || e.type === 'ante') expect(e.amount % 100).toBe(0);
    }
  });
  test('a raise cannot exceed the current pot', () => {
    let s = start(); // pot 400
    s = act(s, { type: 'see' });
    expect(legalActions(s).bets.find(b => b.raise)?.amount).toBe(400);
    s.currentBlind = 200; // seen raise would be 800 > pot 400
    expect(legalActions(s).bets.find(b => b.raise)).toBeUndefined();
  });
  test('cannot bet more chips than the player has', () => {
    const s = start('imaginary', 4, 1, 250); // 150 left after ante
    expect(legalActions(s).bets.map(b => b.amount)).toEqual([100]);
  });
});

describe('Playing Blind', () => {
  test('blind cap: a still-blind bet never exceeds 800 on Silver; above it the player must see or fold', () => {
    let s = start();
    s.currentBlind = 800;
    s.pot = 5000;
    expect(legalActions(s).bets).toEqual([{ amount: 800, raise: false }]); // 1,600 raise is over the cap
    s.currentBlind = 1600;
    const l = legalActions(s);
    expect(l.mustSee).toBe(true);
    expect(l.bets).toEqual([]);
    expect(l.canFold).toBe(true);
    s = act(s, { type: 'see' });
    expect(legalActions(s).bets[0].amount).toBe(3200);
  });
  test('after 4 blind actions the 5th turn forces a free see', () => {
    let s = start('imaginary', 4, 3);
    for (let i = 0; i < 16; i++) {
      // Everyone stays blind and calls.
      s = act(s, { type: 'bet', raise: false });
    }
    expect(s.players.every(p => p.blindActions === 4)).toBe(true);
    const p = s.players[s.turn];
    expect(p.seen).toBe(true);
    expect(s.log.some(e => e.type === 'see' && e.forced && e.playerId === p.id)).toBe(true);
    expect(legalActions(s).bets[0].amount).toBe(200);
  });
  test('a player can see between actions for free, without changing the turn', () => {
    const s = start();
    const t = seeCards(s, 0); // p1 is acting; p0 looks early
    expect(t.players[0].seen).toBe(true);
    expect(t.turn).toBe(s.turn);
    expect(t.pot).toBe(s.pot);
    expect(s.players[0].seen).toBe(false);
    expect(seeCards(t, 0)).toBe(t);
  });
  test('once seen, always seen', () => {
    let s = start();
    s = act(s, { type: 'see' });
    expect(() => act(s, { type: 'see' })).toThrow();
  });
});

describe('fold and last player standing', () => {
  test('pot goes to the last player; seen winner gets no bonus', () => {
    let s = start();
    const total = chipsInPlay(s);
    s = act(s, { type: 'fold' }); // p1
    s = act(s, { type: 'fold' }); // p2
    s = act(s, { type: 'bet', raise: false }); // p3 blind 100
    s = act(s, { type: 'see' }); // p0
    s = act(s, { type: 'bet', raise: false }); // p0 seen 200
    s = act(s, { type: 'fold' }); // p3
    expect(s.phase).toBe('complete');
    expect(s.result?.winnerId).toBe('p0');
    expect(s.result?.bonus).toBe(0);
    expect(chipsInPlay(s)).toBe(total);
  });
  test('Blind Win: a still-blind winner gets +10% of the pot from the house, not from the pot', () => {
    let s = start(); // pot 400
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' }); // p0 wins blind
    expect(s.result).toMatchObject({ winnerId: 'p0', pot: 400, bonus: 40 });
    expect(s.players[0].chips).toBe(49_900 + 400 + 40);
  });
  test('Blind Win bonus is rounded down and at least 1 chip', () => {
    const cfg = tableConfig('imaginary', { ...SILVER, ante: 1, blindCap: 8, potCap: 128 });
    let s = startHand(cfg, seats(4), 0, seededRng(4)); // pot 4
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    expect(s.result?.bonus).toBe(1);
  });
  test('Centre mode: if only one player remains after round one, the centre stays face down', () => {
    let s = start('centre');
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    expect(s.centreOpen).toBe(false);
    expect(s.log.some(e => e.type === 'centre')).toBe(false);
  });
});

describe('show', () => {
  test('only available with exactly two players; seen pays 2x blind, blind pays 1x', () => {
    let s = start('imaginary', 4, 5);
    expect(legalActions(s).show).toBeNull();
    s = act(s, { type: 'fold' }); // p1
    s = act(s, { type: 'fold' }); // p2
    expect(legalActions(s).show).toEqual({ amount: 100 }); // p3 blind
    s = act(s, { type: 'see' });
    expect(legalActions(s).show).toEqual({ amount: 200 });
  });
  test('imaginary show: trips Aces vs trips Aces decided by suits', () => {
    let s = rig(start('imaginary', 4, 6), ['AD AC', 'KS 2D', '9C 4H', 'AS AH']);
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'see' });
    s = act(s, { type: 'show' });
    expect(s.result?.reason).toBe('show');
    expect(s.result?.winnerId).toBe('p3');
    expect(s.result?.shown).toHaveLength(2);
    expect(s.result?.shown.every(h => h.imaginary)).toBe(true);
  });
  test('centre show during round one opens the centre first', () => {
    let s = rig(start('centre', 4, 7), ['QD QC', '3S 8D', '4C 9H', 'KS KH'], 'KD');
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    expect(s.centreOpen).toBe(false);
    s = act(s, { type: 'see' });
    s = act(s, { type: 'show' });
    expect(s.centreOpen).toBe(true);
    expect(s.result?.winnerId).toBe('p3'); // K-K plus centre K is three of a kind
  });
  test('blind winner at show gets the Blind Win bonus', () => {
    let s = rig(start('imaginary', 4, 8), ['2D 7C', '3S 8D', '4C 9H', 'AS AH']);
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'fold' });
    s = act(s, { type: 'show' }); // p3 blind pays 100
    expect(s.result?.winnerId).toBe('p3');
    expect(s.result?.pot).toBe(500);
    expect(s.result?.bonus).toBe(50);
  });
});

describe('centre mode rounds', () => {
  test('centre opens after everyone still in has acted once; round two starts left of the dealer', () => {
    let s = start('centre', 4, 9);
    s = act(s, { type: 'bet', raise: false }); // p1
    s = act(s, { type: 'bet', raise: false }); // p2
    s = act(s, { type: 'fold' }); // p3
    expect(s.centreOpen).toBe(false);
    s = act(s, { type: 'bet', raise: false }); // p0 (dealer) closes round one
    expect(s.centreOpen).toBe(true);
    expect(s.round).toBe(2);
    expect(s.turn).toBe(1);
    expect(s.log.filter(e => e.type === 'centre')).toHaveLength(1);
  });
});

describe('pot cap', () => {
  test('reaching 128x ante forces a showdown of every remaining hand', () => {
    let s = start('imaginary', 4, 10);
    s.pot = 12_700;
    s = act(s, { type: 'bet', raise: false }); // +100 -> 12,800
    expect(s.phase).toBe('complete');
    expect(s.result?.reason).toBe('potCap');
    expect(s.result?.shown).toHaveLength(4);
  });
});

describe('bots and full hands', () => {
  test('bot-only hands always finish, chips are conserved, exactly one winner', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const mode = seed % 2 ? 'centre' : 'imaginary';
      let s = startHand(tableConfig(mode), seats(4 + (seed % 2), 20_000), seed % 4, seededRng(seed));
      const before = chipsInPlay(s);
      const rng = seededRng(seed + 1000);
      let guard = 0;
      while (s.phase === 'betting') {
        if (guard++ > 1000) throw new Error(`hand ${seed} did not finish`);
        s = act(s, chooseBotAction(s, seed % 3 ? 'medium' : 'easy', rng));
      }
      const r = s.result!;
      expect(r).toBeTruthy();
      expect(chipsInPlay(s)).toBe(before + r.bonus);
      expect(s.players.filter(p => p.id === r.winnerId)).toHaveLength(1);
      expect(activePlayers(s).some(p => p.id === r.winnerId)).toBe(true);
    }
  });
  test('act does not mutate the previous state', () => {
    const s = start();
    const snapshot = JSON.stringify(s);
    act(s, { type: 'bet', raise: true });
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});
