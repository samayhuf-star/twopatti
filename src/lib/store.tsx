import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STARTING_CHIPS } from './config';
import { nextDaily } from './daily';
import { setHapticsEnabled } from './feel';

const KEY = 'twopatti.wallet.v1';

/** Local-only wallet. No server, no account, no purchases in this build. */
interface Saved {
  balance: number;
  ageConfirmed: boolean;
  lastDaily: string | null;
  haptics: boolean;
  handsPlayed: number;
}

const initial: Saved = { balance: STARTING_CHIPS, ageConfirmed: false, lastDaily: null, haptics: true, handsPlayed: 0 };

interface Store extends Saved {
  ready: boolean;
  confirmAge: () => void;
  setBalance: (n: number) => void;
  claimDaily: () => number;
  setHaptics: (on: boolean) => void;
  countHand: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Saved>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Saved> & { streak?: number };
          const { streak: _ignored, ...rest } = parsed;
          const s = { ...initial, ...rest } as Saved;
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

  const value = useMemo<Store>(
    () => ({ ...state, ready, confirmAge, setBalance, claimDaily, setHaptics, countHand }),
    [state, ready, confirmAge, setBalance, claimDaily, setHaptics, countHand],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
