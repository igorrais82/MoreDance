import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'moredance.dancer.v1';

export type DancerProfile = {
  firstName: string;
  lastName: string;
  /** ДД.ММ.ГГГГ */
  birthDate: string;
  avatarUri: string | null;
};

const emptyProfile: DancerProfile = {
  firstName: '',
  lastName: '',
  birthDate: '',
  avatarUri: null,
};

type DancerValue = DancerProfile & {
  ready: boolean;
  fullName: string;
  update: (patch: Partial<DancerProfile>) => void;
};

const DancerContext = createContext<DancerValue | null>(null);

export function DancerProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<DancerProfile>(emptyProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          setProfile({ ...emptyProfile, ...(JSON.parse(raw) as DancerProfile) });
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

  const update = useCallback((patch: Partial<DancerProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo<DancerValue>(
    () => ({
      ...profile,
      ready,
      fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
      update,
    }),
    [profile, ready, update],
  );

  return <DancerContext.Provider value={value}>{children}</DancerContext.Provider>;
}

export function useDancer() {
  const ctx = useContext(DancerContext);
  if (!ctx) throw new Error('useDancer must be used within DancerProvider');
  return ctx;
}
