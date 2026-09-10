import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { allLessons, dances } from '../data/dances';

const STORAGE_KEY = 'moredance.progress.v1';

type ProgressState = {
  completedLessons: string[];
  practiceSeconds: number;
  stars: number;
  dancerName: string;
  poseBestScores: Record<string, number>;
  cameraPracticeSeconds: number;
};

type ProgressContextValue = ProgressState & {
  ready: boolean;
  completeLesson: (lessonId: string) => Promise<void>;
  addPracticeSeconds: (seconds: number) => Promise<void>;
  addCameraPracticeSeconds: (seconds: number) => Promise<void>;
  recordPoseScore: (lessonId: string, score: number) => Promise<void>;
  setDancerName: (name: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLessonComplete: (lessonId: string) => boolean;
  danceProgress: (danceId: string) => { done: number; total: number };
  totalLessons: number;
  level: number;
  averagePoseScore: number;
  nextLesson: {
    danceId: string;
    lessonId: string;
    title: string;
    danceName: string;
  } | null;
};

const defaultState: ProgressState = {
  completedLessons: [],
  practiceSeconds: 0,
  stars: 0,
  dancerName: 'Танцор',
  poseBestScores: {},
  cameraPracticeSeconds: 0,
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw);
          setState({
            ...defaultState,
            ...parsed,
            poseBestScores: parsed.poseBestScores ?? {},
          });
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: ProgressState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const completeLesson = useCallback(
    async (lessonId: string) => {
      if (state.completedLessons.includes(lessonId)) return;
      await persist({
        ...state,
        completedLessons: [...state.completedLessons, lessonId],
        stars: state.stars + 3,
      });
    },
    [persist, state],
  );

  const addPracticeSeconds = useCallback(
    async (seconds: number) => {
      if (seconds <= 0) return;
      const gained = Math.floor(seconds / 30);
      await persist({
        ...state,
        practiceSeconds: state.practiceSeconds + seconds,
        stars: state.stars + gained,
      });
    },
    [persist, state],
  );

  const addCameraPracticeSeconds = useCallback(
    async (seconds: number) => {
      if (seconds <= 0) return;
      await persist({
        ...state,
        cameraPracticeSeconds: state.cameraPracticeSeconds + seconds,
        practiceSeconds: state.practiceSeconds + seconds,
        stars: state.stars + Math.floor(seconds / 25),
      });
    },
    [persist, state],
  );

  const recordPoseScore = useCallback(
    async (lessonId: string, score: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(score)));
      const prev = state.poseBestScores[lessonId] ?? 0;
      if (clamped <= prev) return;
      const bonus = clamped >= 80 ? 2 : clamped >= 60 ? 1 : 0;
      await persist({
        ...state,
        poseBestScores: { ...state.poseBestScores, [lessonId]: clamped },
        stars: state.stars + bonus,
      });
    },
    [persist, state],
  );

  const setDancerName = useCallback(
    async (name: string) => {
      await persist({
        ...state,
        dancerName: name.trim().slice(0, 18) || 'Танцор',
      });
    },
    [persist, state],
  );

  const resetProgress = useCallback(async () => {
    await persist({
      ...defaultState,
      dancerName: state.dancerName,
    });
  }, [persist, state.dancerName]);

  const isLessonComplete = useCallback(
    (lessonId: string) => state.completedLessons.includes(lessonId),
    [state.completedLessons],
  );

  const danceProgress = useCallback(
    (danceId: string) => {
      const dance = dances.find((d) => d.id === danceId);
      if (!dance) return { done: 0, total: 0 };
      const done = dance.lessons.filter((l) =>
        state.completedLessons.includes(l.id),
      ).length;
      return { done, total: dance.lessons.length };
    },
    [state.completedLessons],
  );

  const totalLessons = allLessons().length;
  const level = Math.max(1, Math.floor(state.stars / 12) + 1);

  const averagePoseScore = useMemo(() => {
    const values = Object.values(state.poseBestScores);
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [state.poseBestScores]);

  const nextLesson = useMemo(() => {
    for (const dance of dances) {
      for (const lesson of dance.lessons) {
        if (!state.completedLessons.includes(lesson.id)) {
          return {
            danceId: dance.id,
            lessonId: lesson.id,
            title: lesson.title,
            danceName: dance.name,
          };
        }
      }
    }
    return null;
  }, [state.completedLessons]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...state,
      ready,
      completeLesson,
      addPracticeSeconds,
      addCameraPracticeSeconds,
      recordPoseScore,
      setDancerName,
      resetProgress,
      isLessonComplete,
      danceProgress,
      totalLessons,
      level,
      averagePoseScore,
      nextLesson,
    }),
    [
      state,
      ready,
      completeLesson,
      addPracticeSeconds,
      addCameraPracticeSeconds,
      recordPoseScore,
      setDancerName,
      resetProgress,
      isLessonComplete,
      danceProgress,
      totalLessons,
      level,
      averagePoseScore,
      nextLesson,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
