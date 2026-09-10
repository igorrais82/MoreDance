import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'moredance.parent.v1';

type ParentState = {
  pinHash: string | null;
  parentName: string;
  dailyGoalMinutes: number;
  unlockedUntil: number | null;
};

type ParentContextValue = ParentState & {
  ready: boolean;
  isUnlocked: boolean;
  hasPin: boolean;
  setupPin: (pin: string, parentName?: string) => Promise<boolean>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setDailyGoalMinutes: (minutes: number) => Promise<void>;
  setParentName: (name: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
};

const defaultState: ParentState = {
  pinHash: null,
  parentName: 'Родитель',
  dailyGoalMinutes: 15,
  unlockedUntil: null,
};

const ParentContext = createContext<ParentContextValue | null>(null);

async function hashPin(pin: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `moredance-parent:${pin}`,
  );
}

export function ParentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ParentState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as ParentState;
          setState({
            ...defaultState,
            ...parsed,
            unlockedUntil: null,
          });
        }
      } catch {
        // defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: ParentState) => {
    setState(next);
    const { unlockedUntil: _u, ...stored } = next;
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...stored, unlockedUntil: null }),
    );
  }, []);

  const setupPin = useCallback(
    async (pin: string, parentName = 'Родитель') => {
      if (!/^\d{4}$/.test(pin)) return false;
      const pinHash = await hashPin(pin);
      await persist({
        ...state,
        pinHash,
        parentName: parentName.trim().slice(0, 24) || 'Родитель',
        unlockedUntil: Date.now() + 15 * 60 * 1000,
      });
      return true;
    },
    [persist, state],
  );

  const unlock = useCallback(
    async (pin: string) => {
      if (!state.pinHash) return false;
      const pinHash = await hashPin(pin);
      if (pinHash !== state.pinHash) return false;
      setState((prev) => ({
        ...prev,
        unlockedUntil: Date.now() + 15 * 60 * 1000,
      }));
      return true;
    },
    [state.pinHash],
  );

  const lock = useCallback(() => {
    setState((prev) => ({ ...prev, unlockedUntil: null }));
  }, []);

  const setDailyGoalMinutes = useCallback(
    async (minutes: number) => {
      const dailyGoalMinutes = Math.min(90, Math.max(5, Math.round(minutes)));
      await persist({ ...state, dailyGoalMinutes });
    },
    [persist, state],
  );

  const setParentName = useCallback(
    async (name: string) => {
      await persist({
        ...state,
        parentName: name.trim().slice(0, 24) || 'Родитель',
      });
    },
    [persist, state],
  );

  const changePin = useCallback(
    async (oldPin: string, newPin: string) => {
      if (!state.pinHash || !/^\d{4}$/.test(newPin)) return false;
      const oldHash = await hashPin(oldPin);
      if (oldHash !== state.pinHash) return false;
      const pinHash = await hashPin(newPin);
      await persist({ ...state, pinHash });
      return true;
    },
    [persist, state],
  );

  const isUnlocked =
    state.unlockedUntil != null && state.unlockedUntil > Date.now();

  const value = useMemo<ParentContextValue>(
    () => ({
      ...state,
      ready,
      isUnlocked,
      hasPin: Boolean(state.pinHash),
      setupPin,
      unlock,
      lock,
      setDailyGoalMinutes,
      setParentName,
      changePin,
    }),
    [
      state,
      ready,
      isUnlocked,
      setupPin,
      unlock,
      lock,
      setDailyGoalMinutes,
      setParentName,
      changePin,
    ],
  );

  return (
    <ParentContext.Provider value={value}>{children}</ParentContext.Provider>
  );
}

export function useParent() {
  const ctx = useContext(ParentContext);
  if (!ctx) throw new Error('useParent must be used within ParentProvider');
  return ctx;
}
