export interface Achievement {
  id: string;
  title: string;
  desc: string;
  check: (stats: PlayerStats) => boolean;
}

export interface PlayerStats {
  handsPlayed: number;
  wins: number;
  blindWins: number;
  biggestPot: number;
  streak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Win', desc: 'Win your first hand', check: s => s.wins >= 1 },
  { id: 'ten_hands', title: 'Getting Warm', desc: 'Play 10 hands', check: s => s.handsPlayed >= 10 },
  { id: 'blind_hero', title: 'Blind Hero', desc: 'Win a hand while still blind', check: s => s.blindWins >= 1 },
  { id: 'big_pot', title: 'Big Pot', desc: 'Win a pot of 5,000 or more', check: s => s.biggestPot >= 5000 },
  { id: 'streak_3', title: 'On Fire', desc: 'Win 3 hands in a row', check: s => s.streak >= 3 },
];

export function unlockedAchievements(stats: PlayerStats): string[] {
  return ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id);
}
