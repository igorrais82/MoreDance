import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { allLessons, dances } from '../data/dances';
import { dayKey, streakDays } from '../lib/day';
import { rankFor, xpFor } from '../lib/dancer';

const STORAGE_KEY = 'moredance.progress.v1';

type ProgressState = {
  completedLessons: string[];
  practiceSeconds: number;
  stars: number;
  dancerName: string;
  /**
   * Рекорды удержания (секунды) по урокам: и «рама», и поза перед камерой.
   * Оценок «на глаз» здесь нет специально — считается только реальное время.
   */
  frameBestSeconds: Record<string, number>;
  cameraPracticeSeconds: number;
  /** Практика по дням: «2026-11-03» → секунды. Нужна для дневной цели и серии. */
  practiceByDay: Record<string, number>;
};

type ProgressContextValue = ProgressState & {
  ready: boolean;
  completeLesson: (lessonId: string) => Promise<void>;
  addPracticeSeconds: (seconds: number) => Promise<void>;
  addCameraPracticeSeconds: (seconds: number) => Promise<void>;
  recordFrameHold: (lessonId: string, seconds: number) => Promise<void>;
  setDancerName: (name: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLessonComplete: (lessonId: string) => boolean;
  danceProgress: (danceId: string) => { done: number; total: number };
  totalLessons: number;
  /** Практика за сегодня (по локальному календарю). */
  todayPracticeSeconds: number;
  /** Дней практики подряд. */
  streakDays: number;
  /** Суммарный опыт и звание — единая шкала прогресса на всех экранах. */
  xp: number;
  rank: ReturnType<typeof rankFor>;
  /** Лучшее удержание в кадре среди всех уроков, секунды. */
  bestHoldSeconds: number;
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
  frameBestSeconds: {},
  cameraPracticeSeconds: 0,
  practiceByDay: {},
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Уроков в программе. Прогоны не считаются уроками — иначе «Пройдено N из M» не сходится. */
const TOTAL_LESSONS = allLessons().filter((item) => !item.lesson.runthrough).length;

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<ProgressState> & {
            poseBestScores?: Record<string, number>;
          };
          setState({
            ...defaultState,
            ...parsed,
            frameBestSeconds: parsed.frameBestSeconds ?? {},
            practiceByDay: parsed.practiceByDay ?? {},
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

  const commit = useCallback((updater: (prev: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  /** Практика пишется и в общий счётчик, и в календарь по дням. */
  const addToDay = (prev: ProgressState, seconds: number) => {
    const key = dayKey();
    return {
      ...prev.practiceByDay,
      [key]: (prev.practiceByDay[key] ?? 0) + seconds,
    };
  };

  const completeLesson = useCallback(
    async (lessonId: string) => {
      commit((prev) => {
        if (prev.completedLessons.includes(lessonId)) return prev;
        return {
          ...prev,
          completedLessons: [...prev.completedLessons, lessonId],
          stars: prev.stars + 3,
        };
      });
    },
    [commit],
  );

  const addPracticeSeconds = useCallback(
    async (seconds: number) => {
      if (seconds <= 0) return;
      // Звезда за каждые 30 секунд практики под метроном.
      const stars = Math.floor(seconds / 30);
      commit((prev) => ({
        ...prev,
        practiceSeconds: prev.practiceSeconds + seconds,
        stars: prev.stars + stars,
        practiceByDay: addToDay(prev, seconds),
      }));
    },
    [commit],
  );

  const addCameraPracticeSeconds = useCallback(
    async (seconds: number) => {
      if (seconds <= 0) return;
      const stars = Math.floor(seconds / 25);
      commit((prev) => ({
        ...prev,
        cameraPracticeSeconds: prev.cameraPracticeSeconds + seconds,
        practiceSeconds: prev.practiceSeconds + seconds,
        stars: prev.stars + stars,
        practiceByDay: addToDay(prev, seconds),
      }));
    },
    [commit],
  );

  const recordFrameHold = useCallback(
    async (lessonId: string, seconds: number) => {
      const clamped = Math.max(0, Math.floor(seconds));
      if (clamped <= 0) return;
      commit((prev) => {
        const prevBest = prev.frameBestSeconds[lessonId] ?? 0;
        if (clamped <= prevBest) return prev;
        // Звёзды даём за первое пересечение порога, а не за каждый рекорд.
        const bonus =
          clamped >= 120 && prevBest < 120
            ? 4
            : clamped >= 60 && prevBest < 60
              ? 3
              : clamped >= 30 && prevBest < 30
                ? 2
                : 0;
        return {
          ...prev,
          frameBestSeconds: { ...prev.frameBestSeconds, [lessonId]: clamped },
          stars: prev.stars + bonus,
        };
      });
    },
    [commit],
  );

  const setDancerName = useCallback(
    async (name: string) => {
      commit((prev) => ({
        ...prev,
        dancerName: name.trim().slice(0, 18) || 'Танцор',
      }));
    },
    [commit],
  );

  const resetProgress = useCallback(async () => {
    commit((prev) => ({
      ...defaultState,
      dancerName: prev.dancerName,
    }));
  }, [commit]);

  const isLessonComplete = useCallback(
    (lessonId: string) => state.completedLessons.includes(lessonId),
    [state.completedLessons],
  );

  const danceProgress = useCallback(
    (danceId: string) => {
      const dance = dances.find((d) => d.id === danceId);
      if (!dance) return { done: 0, total: 0 };
      // Прогон — не урок: он не входит в счётчик прогресса.
      const lessons = dance.lessons.filter((l) => !l.runthrough);
      const done = lessons.filter((l) =>
        state.completedLessons.includes(l.id),
      ).length;
      return { done, total: lessons.length };
    },
    [state.completedLessons],
  );

  const todayPracticeSeconds = state.practiceByDay[dayKey()] ?? 0;
  const currentStreak = useMemo(
    () => streakDays(state.practiceByDay),
    [state.practiceByDay],
  );

  const xp = xpFor({
    lessons: state.completedLessons.length,
    practiceMinutes: Math.floor(state.practiceSeconds / 60),
    stars: state.stars,
  });
  const rank = useMemo(() => rankFor(xp), [xp]);

  const bestHoldSeconds = useMemo(
    () => Math.max(0, ...Object.values(state.frameBestSeconds)),
    [state.frameBestSeconds],
  );

  const nextLesson = useMemo(() => {
    for (const dance of dances) {
      for (const lesson of dance.lessons) {
        if (lesson.runthrough) continue;
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
      recordFrameHold,
      setDancerName,
      resetProgress,
      isLessonComplete,
      danceProgress,
      totalLessons: TOTAL_LESSONS,
      todayPracticeSeconds,
      streakDays: currentStreak,
      xp,
      rank,
      bestHoldSeconds,
      nextLesson,
    }),
    [
      state,
      ready,
      completeLesson,
      addPracticeSeconds,
      addCameraPracticeSeconds,
      recordFrameHold,
      setDancerName,
      resetProgress,
      isLessonComplete,
      danceProgress,
      todayPracticeSeconds,
      currentStreak,
      xp,
      rank,
      bestHoldSeconds,
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
