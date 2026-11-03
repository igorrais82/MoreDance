import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PoseSilhouette } from '../../../src/components/PoseSilhouette';
import { Text } from '../../../src/components/Text';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { getLessonMedia } from '../../../src/data/media';
import { formatHold } from '../../../src/lib/frame';
import { withAlpha } from '../../../src/lib/color';
import { colors, fonts, radius, spacing, type } from '../../../src/theme';
import { goBack } from '../../../src/lib/nav';

type Phase = 'idle' | 'holding' | 'stepDone' | 'done';

/**
 * «Зеркало»: ребёнок встаёт перед камерой и держит позу из урока.
 *
 * Приложение честно считает только время удержания - никаких процентов
 * «похожести на эталон» здесь нет, потому что скелет не распознаётся.
 * Результат - рекорд удержания в секундах и время практики у зеркала.
 */
export default function PoseScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const media = getLessonMedia(lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCameraPracticeSeconds, recordFrameHold, completeLesson, frameBestSeconds } =
    useProgress();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [held, setHeld] = useState(0);
  const [ellapsed, setEllapsed] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const startedAt = useRef<number | null>(null);
  const holdStarted = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (startedAt.current != null) {
        const sec = Math.floor((Date.now() - startedAt.current) / 1000);
        addCameraPracticeSeconds(sec).catch(() => undefined);
      }
    };
  }, [addCameraPracticeSeconds]);

  const targetSeconds = media?.pose.holdSeconds ?? 3;

  useEffect(() => {
    if (phase !== 'holding') return;
    holdStarted.current = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - (holdStarted.current ?? Date.now())) / 1000;
      setHeld(Math.min(targetSeconds, elapsed));
      if (elapsed >= targetSeconds) {
        clearInterval(tick);
        setHeld(targetSeconds);
        setResults((prev) => [...prev, Math.round(targetSeconds)]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined,
        );
        setPhase('stepDone');
      }
    }, 100);
    return () => clearInterval(tick);
  }, [phase, targetSeconds, stepIndex]);

  // Общее время «в кадре» для сессии, пока экран открыт.
  useEffect(() => {
    if (phase === 'done') return;
    const tick = setInterval(() => {
      if (startedAt.current != null) {
        setEllapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 500);
    return () => clearInterval(tick);
  }, [phase]);

  if (!data || !media) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Камера недоступна для урока</Text>
        <Pressable
          onPress={() => goBack(router)}
          accessibilityRole="button"
          accessibilityLabel="Назад к уроку"
        >
          <Text style={styles.link}>← Назад</Text>
        </Pressable>
      </View>
    );
  }

  const { dance, lesson } = data;
  const steps = lesson.steps;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const lastStep = stepIndex >= steps.length - 1;
  const lessonBest = frameBestSeconds[lesson.id] ?? 0;
  const sessionBest = Math.max(0, ...results);

  const startHold = () => {
    if (startedAt.current == null) startedAt.current = Date.now();
    setHeld(0);
    setPhase('holding');
  };

  const finishSession = async (nextResults: number[]) => {
    const best = Math.max(0, ...nextResults);
    if (best > 0) await recordFrameHold(lesson.id, best);
    await completeLesson(lesson.id);
    if (startedAt.current != null) {
      const sec = Math.floor((Date.now() - startedAt.current) / 1000);
      await addCameraPracticeSeconds(sec);
      startedAt.current = null;
    }
    setPhase('done');
  };

  const nextStep = () => {
    if (lastStep) {
      finishSession(results);
      return;
    }
    setStepIndex((i) => i + 1);
    setHeld(0);
    setPhase('idle');
  };

  if (!permission) {
    return <View style={styles.fallback} />;
  }

  const cameraAllowed = permission.granted && !cameraError;

  return (
    <View style={styles.root}>
      {cameraAllowed ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
          mirror
          onMountError={() => setCameraError(true)}
        />
      ) : null}
      <View style={[styles.overlay, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => goBack(router)}
          accessibilityRole="button"
          accessibilityLabel="Назад к уроку"
        >
          <Text style={styles.back}>← К уроку</Text>
        </Pressable>
        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.meta}>
          Поза {Math.min(stepIndex + 1, steps.length)}/{steps.length} · в кадре{' '}
          {formatHold(ellapsed)} · лучший результат{' '}
          {formatHold(lessonBest > 0 ? lessonBest : sessionBest)}
        </Text>

        <View style={styles.stage}>
          <PoseSilhouette
            stance={media.pose.stance}
            arms={media.pose.arms}
            accent={dance.accent}
            active={phase === 'holding' || phase === 'idle'}
          />
          <View style={styles.holdBubble}>
            <Text style={styles.holdValue}>
              {held.toFixed(1).replace('.', ',')}
            </Text>
            <Text style={styles.holdLabel}>сек держишь</Text>
          </View>
        </View>

        {!cameraAllowed ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              {permission.granted ? 'Камера не отвечает' : 'Камера выключена'}
            </Text>
            <Text style={styles.noticeCopy}>
              {permission.granted
                ? 'Похоже, на этом устройстве камера недоступна. Таймер удержания всё равно работает — держи позу и считай вместе с ним.'
                : 'Разреши камеру, чтобы видеть себя в зеркале. Без камеры таймер удержания тоже работает.'}
            </Text>
            {!permission.granted ? (
              <Pressable
                onPress={requestPermission}
                accessibilityRole="button"
                accessibilityLabel="Разрешить камеру"
                style={({ pressed }) => [styles.primary, { backgroundColor: dance.accent }, pressed && styles.pressed]}
              >
                <Text style={[styles.primaryText, { color: colors.bg }]}>
                  Разрешить камеру
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          {phase === 'done' ? (
            <>
              <Text style={styles.cardTitle}>Тренировка у зеркала закончена</Text>
              <Text style={styles.cardCopy}>
                Лучшее удержание: {formatHold(sessionBest)}. Урок засчитан, время
                в кадре добавлено к практике.
              </Text>
              <Pressable
                onPress={() => goBack(router)}
                accessibilityRole="button"
                accessibilityLabel="Готово, вернуться к уроку"
                style={({ pressed }) => [styles.primary, { backgroundColor: dance.accent }, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>Готово</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.stepCount}>{step.count}</Text>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardCopy}>
                {phase === 'holding' ? media.pose.cue : step.instruction}
              </Text>
              {phase === 'idle' ? (
                <>
                  <Text style={styles.hint}>
                    Нажми и держи позу {targetSeconds} сек. Приложение считает
                    время, а не оценивает технику - смотри в зеркало.
                  </Text>
                  <Pressable
                    onPress={startHold}
                    accessibilityRole="button"
                    accessibilityLabel="Начать удержание позы"
                    style={({ pressed }) => [styles.primary, { backgroundColor: dance.accent }, pressed && styles.pressed]}
                  >
                    <Text style={styles.primaryText}>Начать удержание</Text>
                  </Pressable>
                </>
              ) : null}
              {phase === 'holding' ? (
                <>
                  <Text style={[styles.hold, { color: dance.accent }]}>
                    Держи… {Math.max(0, Math.ceil(targetSeconds - held))}
                  </Text>
                  <View style={styles.holdTrack}>
                    <View
                      style={[
                        styles.holdFill,
                        {
                          width: `${Math.round((held / targetSeconds) * 100)}%`,
                          backgroundColor: dance.accent,
                        },
                      ]}
                    />
                  </View>
                </>
              ) : null}
              {phase === 'stepDone' ? (
                <>
                  <Text style={[styles.hold, { color: colors.mint }]}>
                    Поза удержана: {formatHold(Math.round(targetSeconds))}
                  </Text>
                  <Pressable
                    onPress={nextStep}
                    accessibilityRole="button"
                    accessibilityLabel={lastStep ? 'Завершить тренировку' : 'Следующая поза'}
                    style={({ pressed }) => [styles.primary, { backgroundColor: colors.mint }, pressed && styles.pressed]}
                  >
                    <Text style={[styles.primaryText, { color: colors.bg }]}>
                      {lastStep ? 'Завершить тренировку' : 'Следующая поза'}
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    backgroundColor: withAlpha(colors.bg, 0.4),
  },
  back: {
    ...type.link,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1,
  },
  title: {
    ...type.screen,
  },
  meta: {
    ...type.caption,
    marginBottom: spacing.sm,
  },
  link: {
    ...type.link,
    marginTop: spacing.md,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  holdBubble: {
    position: 'absolute',
    right: 0,
    top: spacing.sm,
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    minWidth: 112,
  },
  holdValue: {
    fontFamily: fonts.brand,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
  },
  holdLabel: {
    ...type.caption,
  },
  notice: {
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  noticeTitle: {
    ...type.cardTitle,
  },
  noticeCopy: {
    ...type.small,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.tile,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepCount: {
    fontFamily: fonts.brand,
    fontSize: 24,
    lineHeight: 30,
    color: colors.sky,
  },
  cardTitle: {
    ...type.cardTitle,
    fontSize: 19,
    lineHeight: 25,
    marginBottom: spacing.xs,
  },
  cardCopy: {
    ...type.bodyMuted,
    marginBottom: spacing.sm,
  },
  hint: {
    ...type.small,
    marginBottom: spacing.sm,
  },
  hold: {
    ...type.section,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  holdTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  holdFill: {
    height: '100%',
  },
  primary: {
    backgroundColor: colors.coral,
    borderRadius: radius.card,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    ...type.button,
    color: colors.bg,
  },
  pressed: {
    opacity: 0.88,
  },
});
