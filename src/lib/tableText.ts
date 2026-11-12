import { GameState, LogEvent, compareMade, describeMade, CATEGORY_NAME, Category } from '../engine';
import { formatChips } from '../theme';

/** Short label of each player's most recent action, for the seat caption. */
export function lastActions(s: GameState): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of s.log as LogEvent[]) {
    if (e.type === 'bet') out[e.playerId] = `${e.raise ? 'Raise' : e.blind ? 'Blind' : 'Bet'} ${formatChips(e.amount)}`;
    else if (e.type === 'fold') out[e.playerId] = 'Fold';
    else if (e.type === 'show') out[e.playerId] = `Show ${formatChips(e.amount)}`;
    else if (e.type === 'see') out[e.playerId] = e.forced ? 'Must see' : 'Seen';
  }
  return out;
}

export function winnerTitle(s: GameState, humanId: string): { title: string; subtitle: string; big: boolean } {
  const r = s.result!;
  const winner = s.players.find(p => p.id === r.winnerId)!;
  const hand = r.shown.find(h => h.playerId === r.winnerId);
  const big = !!hand && (hand.made.category === Category.ThreeOfAKind || hand.made.category === Category.StraightFlush);
  const who = winner.id === humanId ? 'You win' : `${winner.name} wins`;
  if (big && hand) return { title: `${CATEGORY_NAME[hand.made.category].toUpperCase()}!`, subtitle: `${who} with ${describeMade(hand.made)}`, big };
  if (r.reason === 'lastStanding') return { title: winner.id === humanId ? 'YOU WIN!' : `${winner.name.toUpperCase()} WINS`, subtitle: 'Everyone else folded', big: false };
  return { title: winner.id === humanId ? 'YOU WIN!' : `${winner.name.toUpperCase()} WINS`, subtitle: hand ? describeMade(hand.made) : '', big: false };
}

/** True when the best two shown hands were equal in rank and suits decided. */
export function suitsDecided(s: GameState): boolean {
  const r = s.result;
  if (!r || r.shown.length < 2) return false;
  const win = r.shown.find(h => h.playerId === r.winnerId)!;
  return r.shown.some(h => h.playerId !== r.winnerId && compareMade(h.made, win.made) === 0);
}
