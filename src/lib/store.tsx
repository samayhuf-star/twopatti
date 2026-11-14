import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STARTING_CHIPS } from './config';
import { nextDaily } from './daily';
import { setHapticsEnabled } from './feel';
import { unlockedAchievements } from './achievements';

const KEY = 'twopatti.wallet.v1';

interface Saved {
  balance: number;
  ageConfirmed: boolean;
  lastDaily: string | null;
  haptics: boolean;
  handsPlayed: number;
  wins: number;
  blindWins: number;
  biggestPot: number;
  currentStreak: number;
  bestStreak: number;
  achievements: string[];
}

const initial: Saved = {
  balance: STARTING_CHIPS,
  ageConfirmed: false,
  lastDaily: null,
  haptics: true,
  handsPlayed: 0,
  wins: 0,
  blindWins: 0,
  biggestPot: 0,
  currentStreak: 0,
  bestStreak: 0,
  achievements: [],
};

interface Store extends Saved {
  ready: boolean;
  confirmAge: () => void;
  setBalance: (n: number) => void;
  claimDaily: () => number;
  setHaptics: (on: boolean) => void;
  countHand: () => void;
  recordWin: (pot: number, blind: boolean) => void;
  recordLoss: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Saved>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Saved>;
          const s = { ...initial, ...parsed } as Saved;
          setHapticsEnabled(s.haptics);
          setState(s);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const confirmAge = useCallback(() => setState(s => ({ ...s, ageConfirmed: true })), []);
  const setBalance = useCallback((n: number) => setState(s => (s.balance === n ? s : { ...s, balance: Math.max(0, Math.floor(n)) })), []);
  const claimDaily = useCallback(() => {
    const d = nextDaily(state.lastDaily);
    if (!d.available) return 0;
    setState(s => ({ ...s, balance: s.balance + d.amount, lastDaily: d.today }));
    return d.amount;
  }, [state.lastDaily]);
  const setHaptics = useCallback((on: boolean) => {
    setHapticsEnabled(on);
    setState(s => ({ ...s, haptics: on }));
  }, []);
  const countHand = useCallback(() => setState(s => ({ ...s, handsPlayed: s.handsPlayed + 1 })), []);

  const recordWin = useCallback((pot: number, blind: boolean) => {
    setState(s => {
      const wins = s.wins + 1;
      const blindWins = s.blindWins + (blind ? 1 : 0);
      const biggestPot = Math.max(s.biggestPot, pot);
      const currentStreak = s.currentStreak + 1;
      const bestStreak = Math.max(s.bestStreak, currentStreak);
      const stats = { handsPlayed: s.handsPlayed, wins, blindWins, biggestPot, streak: currentStreak };
      const achievements = unlockedAchievements(stats);
      return { ...s, wins, blindWins, biggestPot, currentStreak, bestStreak, achievements };
    });
  }, []);

  const recordLoss = useCallback(() => {
    setState(s => ({ ...s, currentStreak: 0 }));
  }, []);

  const value = useMemo<Store>(
    () => ({ ...state, ready, confirmAge, setBalance, claimDaily, setHaptics, countHand, recordWin, recordLoss }),
    [state, ready, confirmAge, setBalance, claimDaily, setHaptics, countHand, recordWin, recordLoss],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
