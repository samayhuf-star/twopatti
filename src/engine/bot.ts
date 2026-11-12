import { Rng } from './cards';
import { Category, bestImaginary, evaluateThree, preflopStrength } from './hand';
import { Action, GameState, activePlayers, legalActions } from './game';

export type BotLevel = 'easy' | 'medium';

/**
 * Hand strength from the bot's own cards and public information only.
 * It never reads another player's hole cards.
 * Returns roughly 0 (weak) to 1 (very strong).
 */
export function botStrength(s: GameState, playerIndex: number): number {
  const p = s.players[playerIndex];
  if (s.config.mode === 'imaginary') {
    // Bots evaluate their own two cards only (independent completion never needs other hands).
    const made = bestImaginary(p.hole, 'independent').made;
    switch (made.category) {
      case Category.ThreeOfAKind:
        return 0.9 + made.key[0] / 140;
      case Category.StraightFlush:
        return 0.82 + made.key[0] / 150;
      case Category.Straight:
        return 0.6 + made.key[0] / 60;
      case Category.Flush:
        return 0.45 + made.key[0] / 60;
      default:
        // Every unpaired hand imagines a pair of its high card.
        return 0.05 + made.key[0] / 40;
    }
  }
  if (s.centreOpen && s.centre) {
    const made = evaluateThree([...p.hole, s.centre]);
    switch (made.category) {
      case Category.ThreeOfAKind:
        return 1;
      case Category.StraightFlush:
        return 0.95;
      case Category.Straight:
        return 0.8 + made.key[0] / 150;
      case Category.Flush:
        return 0.65 + made.key[0] / 100;
      case Category.Pair:
        return 0.35 + made.key[0] / 40;
      default:
        return made.key[0] / 60;
    }
  }
  return Math.min(1, preflopStrength(p.hole) / 1.3);
}

/** Pick an action for the bot whose turn it is. Easy is loose and passive; Medium is tight-aggressive. */
export function chooseBotAction(s: GameState, level: BotLevel, rng: Rng): Action {
  const i = s.turn;
  const p = s.players[i];
  const legal = legalActions(s, i);
  const ante = s.config.ante;

  // Blind play: Medium stays blind sometimes, Easy a little more often.
  if (!p.seen) {
    const stayBlindChance = level === 'easy' ? 0.45 : 0.3;
    const pressure = s.currentBlind / ante; // grows with raises
    if (legal.mustSee || pressure > 4 || rng() > stayBlindChance || legal.bets.length === 0) {
      return { type: 'see' };
    }
    if (legal.show && rng() < 0.25) return { type: 'show' };
    const raise = legal.bets.find(b => b.raise);
    if (raise && rng() < 0.15) return { type: 'bet', raise: true };
    return { type: 'bet', raise: false };
  }

  const strength = botStrength(s, i);
  const call = legal.bets.find(b => !b.raise);
  const raise = legal.bets.find(b => b.raise);
  const costRatio = call ? call.amount / Math.max(s.pot, 1) : 1;
  const heads = activePlayers(s).length === 2;
  const bluff = level === 'medium' ? 0.06 : 0.02;
  const r = rng();

  if (heads && legal.show) {
    // Easy shows early; Medium shows with a decent hand or when betting gets expensive.
    const showAt = level === 'easy' ? 0.35 : 0.5;
    if (strength >= showAt || costRatio > 0.35) return strength > 0.2 || r < 0.5 ? { type: 'show' } : { type: 'fold' };
  }
  if (!call) return legal.show ? { type: 'show' } : { type: 'fold' };

  const foldBelow = level === 'easy' ? 0.18 + costRatio * 0.3 : 0.25 + costRatio * 0.5;
  if (strength < foldBelow && r > bluff) return { type: 'fold' };
  const raiseAbove = level === 'easy' ? 0.85 : 0.7;
  if (raise && (strength > raiseAbove || r < bluff)) return { type: 'bet', raise: true };
  return { type: 'bet', raise: false };
}
