import { parseCard, parseCards, sameCard, Card } from '../cards';
import {
  Category,
  bestImaginary,
  compareMade,
  compareShowdown,
  describeMade,
  evaluateThree,
  holeSuitKey,
  straightValue,
  WHEEL_STRAIGHT_VALUE,
} from '../hand';

const ev = (ids: string) => evaluateThree(parseCards(ids));
const cmp = (a: string, b: string) => Math.sign(compareMade(ev(a), ev(b)));

describe('hand categories', () => {
  test.each([
    ['AS AH AD', Category.ThreeOfAKind],
    ['2S 2H 2C', Category.ThreeOfAKind],
    ['AS 2S 3S', Category.StraightFlush],
    ['QH KH AH', Category.StraightFlush],
    ['4D 3D 2D', Category.StraightFlush],
    ['AS 2H 3S', Category.Straight],
    ['JH 10D 9C', Category.Straight],
    ['AH 9H 5H', Category.Flush],
    ['KS KD 7C', Category.Pair],
    ['7C KS KD', Category.Pair],
    ['AS KH 9C', Category.HighCard],
  ])('%s is category %s', (ids, cat) => {
    expect(ev(ids as string).category).toBe(cat);
  });

  test('no wrap-around: K-A-2 is not a straight', () => {
    expect(ev('KS AH 2D').category).toBe(Category.HighCard);
    expect(straightValue([13, 14, 2])).toBe(0);
  });

  test('category order: trips > straight flush > straight > flush > pair > high card', () => {
    const order = ['2S 2H 2C', 'AS 2S 3S', 'AS 2H 3S', 'AH 9H 5H', 'KS KD 7C', 'AS KH 9C'];
    for (let i = 0; i < order.length - 1; i++) expect(cmp(order[i], order[i + 1])).toBe(1);
  });
});

describe('A-2-3 is the highest straight', () => {
  test('A-2-3 beats A-K-Q (straight and straight flush)', () => {
    expect(cmp('AS 2H 3D', 'AS KH QD')).toBe(1);
    expect(cmp('AH 2H 3H', 'AS KS QS')).toBe(1);
    expect(ev('AH 2H 3H').key[0]).toBe(WHEEL_STRAIGHT_VALUE);
  });
  test('A-K-Q beats K-Q-J, and 4-3-2 is the lowest straight', () => {
    expect(cmp('AS KH QD', 'KS QH JD')).toBe(1);
    expect(cmp('5S 4H 3D', '4S 3H 2D')).toBe(1);
    expect(cmp('4S 3H 2D', 'AS 2H 3D')).toBe(-1);
  });
  test('spec example: centre 2C, A3 vs 43, A-2-3 wins', () => {
    expect(cmp('AS 3H 2C', '4H 3D 2C')).toBe(1);
  });
});

describe('within-category order', () => {
  test('trips by rank', () => expect(cmp('AS AH AD', 'KS KH KD')).toBe(1));
  test('flush compares high, middle, low', () => {
    expect(cmp('AH 9H 5H', 'AS 9S 4S')).toBe(1);
    expect(cmp('KH QH 9H', 'AS 7S 4S')).toBe(-1);
  });
  test('pair then kicker', () => {
    expect(cmp('KS KD 7C', 'QS QD AC')).toBe(1);
    expect(cmp('KS KD 8C', 'KH KC 7C')).toBe(1);
    expect(compareMade(ev('KS KD 7C'), ev('KH KC 7H'))).toBe(0);
  });
  test('high card compares all three', () => {
    expect(cmp('AS KH 9C', 'AS KH 8C')).toBe(1);
    expect(cmp('AS 10H 9C', 'KS 10H 8C')).toBe(1);
    expect(cmp('AS 10H 9C', 'KS QH JC')).toBe(-1); // K-Q-J is a straight, not a high card
  });
});

describe('centre mode examples from the spec', () => {
  const centreWin = (centre: string, you: string, opp: string) => {
    const c = parseCard(centre);
    const a = parseCards(you);
    const b = parseCards(opp);
    return compareShowdown(
      { made: evaluateThree([...a, c]), hole: a },
      { made: evaluateThree([...b, c]), hole: b },
    );
  };
  test('K centre: K-K makes trips and beats A-A', () => expect(centreWin('KC', 'KS KH', 'AS AH')).toBeGreaterThan(0));
  test('9C centre: J-10 straight beats A-K high', () => expect(centreWin('9C', 'AS KS', 'JH 10H')).toBeLessThan(0));
  test('5H centre: A9 hearts flush beats K-K pair', () => expect(centreWin('5H', 'AH 9H', 'KS KD')).toBeGreaterThan(0));
  test('QC centre: A-K-Q beats Q-J-10', () => expect(centreWin('QC', 'AS KH', 'JH 10D')).toBeGreaterThan(0));
  test('2C centre: A-3 makes A-2-3 and beats 4-3', () => expect(centreWin('2C', 'AS 3H', '4H 3D')).toBeGreaterThan(0));
});

describe('suit tie-breaks (S > H > D > C), always one winner', () => {
  test('hole suit key sorts by rank, pair puts better suit first', () => {
    expect(holeSuitKey(parseCards('9D AS'))).toEqual([4, 2]);
    expect(holeSuitKey(parseCards('AD AS'))).toEqual([4, 2]);
  });
  test('trips Aces in imaginary mode: A\u2660 A\u2665 beats A\u2666 A\u2663', () => {
    const a = parseCards('AS AH');
    const b = parseCards('AD AC');
    const ma = bestImaginary(a).made;
    const mb = bestImaginary(b).made;
    expect(compareMade(ma, mb)).toBe(0);
    expect(compareShowdown({ made: ma, hole: a }, { made: mb, hole: b })).toBeGreaterThan(0);
  });
  test('centre mode equal ranks: higher card suit first, then second card', () => {
    const c = parseCard('7C');
    const a = parseCards('AS KD');
    const b = parseCards('AH KS');
    const r = compareShowdown(
      { made: evaluateThree([...a, c]), hole: a },
      { made: evaluateThree([...b, c]), hole: b },
    );
    expect(r).toBeGreaterThan(0); // Ace of spades outranks Ace of hearts, before looking at the Kings
    const d = parseCards('AH KD');
    const r2 = compareShowdown(
      { made: evaluateThree([...b, c]), hole: b },
      { made: evaluateThree([...d, c]), hole: d },
    );
    expect(r2).toBeGreaterThan(0); // Aces both hearts, then K spades beats K diamonds
  });
  test('imaginary fallback: A\u2660 3\u2665 vs 3\u2660 2\u2665 both make A-2-3 with equal suit pattern, higher real card wins', () => {
    const a = parseCards('AS 3H');
    const b = parseCards('3S 2H');
    const ma = bestImaginary(a).made;
    const mb = bestImaginary(b).made;
    expect(compareMade(ma, mb)).toBe(0);
    expect(compareShowdown({ made: ma, hole: a }, { made: mb, hole: b })).toBeGreaterThan(0);
    expect(compareShowdown({ made: mb, hole: b }, { made: ma, hole: a })).toBeLessThan(0);
  });
  test('fallback order: higher real card first, then the other real card', () => {
    // Synthetic hands (fed straight to the comparator) with the same made hand, the same suit
    // pattern and the same higher card, so only the second real card can decide.
    const made = bestImaginary(parseCards('KS QH')).made; // A-K-Q straight
    const a = parseCards('KS QH');
    const b = parseCards('KS JH');
    expect(compareShowdown({ made, hole: a }, { made, hole: b })).toBeGreaterThan(0);
    expect(compareShowdown({ made, hole: b }, { made, hole: a })).toBeLessThan(0);
  });
  test('exhaustive: any two different hole pairs in centre mode never tie', () => {
    const centre = parseCard('7D');
    const all: Card[][] = [];
    const ids = 'AS AH KD KC 9S 9H 7S 7H 3C 2C'.split(' ').map(parseCard);
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) all.push([ids[i], ids[j]]);
    for (const a of all)
      for (const b of all) {
        if (a.some(x => b.some(y => sameCard(x, y)))) continue;
        const r = compareShowdown(
          { made: evaluateThree([...a, centre]), hole: a },
          { made: evaluateThree([...b, centre]), hole: b },
        );
        if (a === b) continue;
        expect(r).not.toBe(0);
      }
  });
});

describe('imaginary completion evaluator', () => {
  const best = (ids: string) => bestImaginary(parseCards(ids));
  test.each([
    ['7C 7D', 'Three of a Kind, 7s'],
    ['AS AH', 'Three of a Kind, As'],
    ['AS 2S', 'Straight Flush A-2-3'],
    ['AS KS', 'Straight Flush A-K-Q'],
    ['AS KH', 'Straight A-K-Q'],
    ['AH 9H', 'Flush A-K-9'],
    ['AS 9D', 'Pair of As'],
    ['3S 2D', 'Straight A-2-3'],
    ['QS JD', 'Straight K-Q-J'],
  ])('%s -> %s', (ids, label) => {
    expect(describeMade(best(ids as string).made)).toBe(label);
  });

  test('K\u2665 9\u2665 completes to the best flush A-K-9 (spec table lists Q\u2665; A\u2665 is higher)', () => {
    const c = best('KH 9H');
    expect(c.made.category).toBe(Category.Flush);
    expect(c.made.ranks).toEqual([14, 13, 9]);
  });

  test('A-9 cannot become A-K-Q (both real cards stay in the hand)', () => {
    expect(best('AS 9D').made.category).toBe(Category.Pair);
  });

  test('never imagines a card the player already holds', () => {
    for (const ids of ['AS AH', 'AS 2S', '7C 7D', 'KH 9H']) {
      const hole = parseCards(ids);
      const c = bestImaginary(hole);
      expect(hole.some(h => sameCard(h, c.card))).toBe(false);
    }
  });

  test('independent (locked default): may use a card another player holds', () => {
    const c = bestImaginary(parseCards('AS AH'), 'independent', parseCards('AD AC'));
    expect(c.made.category).toBe(Category.ThreeOfAKind);
    expect(c.made.key[0]).toBe(14);
  });

  test('shown card is stable (fixed deck order)', () => {
    expect(bestImaginary(parseCards('7C 7D')).card).toEqual(parseCard('7S'));
    expect(bestImaginary(parseCards('AS 9D')).card).toEqual(parseCard('AH'));
  });

  describe('remainingDeck rule (stricter, not exposed in the app)', () => {
    test('two pairs of Aces: neither can make trips when all four Aces are dealt', () => {
      const c = bestImaginary(parseCards('AS AH'), 'remainingDeck', parseCards('AD AC'));
      expect(c.made.category).toBe(Category.Pair);
    });
    test('blocked straight-flush card falls back to the next best hand', () => {
      const c = bestImaginary(parseCards('AS 2S'), 'remainingDeck', parseCards('3S 9D'));
      // 3♠ is held by someone else, so the straight flush is gone; a 3 of another suit still makes A-2-3.
      expect(describeMade(c.made)).toBe('Straight A-2-3');
      expect(c.card.suit).not.toBe('S');
    });
    test('with nothing excluded it matches the independent rule', () => {
      for (const ids of ['AS AH', 'AS 2S', 'KH 9H', 'QS JD']) {
        const h = parseCards(ids);
        expect(compareMade(bestImaginary(h, 'remainingDeck').made, bestImaginary(h, 'independent').made)).toBe(0);
      }
    });
    test('never returns an excluded card', () => {
      const excluded = parseCards('3S 3H 3D 3C KS');
      const c = bestImaginary(parseCards('AS 2S'), 'remainingDeck', excluded);
      expect(excluded.some(e => sameCard(e, c.card))).toBe(false);
    });
  });
});
