import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PoseSilhouette } from '../../../src/components/PoseSilhouette';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { getLessonMedia } from '../../../src/data/media';
import {
  aggregateSessionScore,
  estimatePoseMatch,
} from '../../../src/pose/scoring';
import { colors, fonts, spacing } from '../../../src/theme';

type Phase = 'idle' | 'holding' | 'between' | 'done';

export default function PoseScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const media = getLessonMedia(lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    addCameraPracticeSeconds,
    recordPoseScore,
    completeLesson,
    poseBestScores,
  } = useProgress();
  const [permission, requestPermission] = useCameraPermissions();

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [holdLeft, setHoldLeft] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [liveScore, setLiveScore] = useState(0);
  const startedAt = useRef<number | null>(null);
  const holdStarted = useRef<number | null>(null);
  const wobble = useRef(0);

  useEffect(() => {
    return () => {
      if (startedAt.current != null) {
        const sec = Math.floor((Date.now() - startedAt.current) / 1000);
        addCameraPracticeSeconds(sec).catch(() => undefined);
      }
    };
  }, [addCameraPracticeSeconds]);

  useEffect(() => {
    if (phase !== 'holding' || !media) return;
    const total = media.pose.holdSeconds * 1000;
    holdStarted.current = Date.now();
    wobble.current = 0.15 + Math.random() * 0.2;

    const tick = setInterval(() => {
      const elapsed = Date.now() - (holdStarted.current ?? Date.now());
      const left = Math.max(0, Math.ceil((total - elapsed) / 1000));
      setHoldLeft(left);
      const heldRatio = Math.min(1, elapsed / total);
      const steadiness = Math.max(0.35, 1 - wobble.current + heldRatio * 0.25);
      setLiveScore(estimatePoseMatch(media.pose, heldRatio, steadiness));

      if (elapsed >= total) {
        clearInterval(tick);
        const final = estimatePoseMatch(media.pose, 1, steadiness);
        setScores((prev) => [...prev, final]);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
        setPhase('between');
      }
    }, 120);

    return () => clearInterval(tick);
  }, [phase, media, stepIndex]);

  if (!data || !media) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Камера недоступна для урока</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const { dance, lesson } = data;
  const sessionScore = aggregateSessionScore(scores);
  const best = poseBestScores[lesson.id] ?? 0;
  const steps = lesson.steps;
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  if (!permission) {
    return <View style={styles.fallback} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.title}>Нужна камера</Text>
        <Text style={styles.copy}>
          Чтобы повторять позы перед зеркалом и получать оценку, разреши доступ к
          камере.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.primaryText}>Разрешить камеру</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const startHold = () => {
    if (startedAt.current == null) startedAt.current = Date.now();
    setLiveScore(0);
    setHoldLeft(media.pose.holdSeconds);
    setPhase('holding');
  };

  const nextStep = async () => {
    if (stepIndex >= steps.length - 1) {
      const finalScore = aggregateSessionScore(
        scores.length ? scores : [liveScore],
      );
      await recordPoseScore(lesson.id, finalScore);
      if (finalScore >= 70) await completeLesson(lesson.id);
      if (startedAt.current != null) {
        const sec = Math.floor((Date.now() - startedAt.current) / 1000);
        await addCameraPracticeSeconds(sec);
        startedAt.current = null;
      }
      setPhase('done');
      return;
    }
    setStepIndex((i) => i + 1);
    setPhase('idle');
  };

  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} facing="front" mirror />
      <View style={[styles.overlay, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← К уроку</Text>
        </Pressable>
        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.meta}>
          Поза {Math.min(stepIndex + 1, steps.length)}/{steps.length} · лучший
          результат {best}%
        </Text>

        <View style={styles.stage}>
          <PoseSilhouette
            stance={media.pose.stance}
            arms={media.pose.arms}
            accent={dance.accent}
            active={phase === 'holding' || phase === 'idle'}
          />
          <View style={styles.scoreBubble}>
            <Text style={styles.scoreValue}>
              {phase === 'done' ? sessionScore : liveScore}%
            </Text>
            <Text style={styles.scoreLabel}>оценка позы</Text>
          </View>
        </View>

        <View style={styles.card}>
          {phase === 'done' ? (
            <>
              <Text style={styles.cardTitle}>Сессия завершена</Text>
              <Text style={styles.cardCopy}>
                Средняя оценка {sessionScore}%.{' '}
                {sessionScore >= 70
                  ? 'Урок засчитан — отличная работа!'
                  : 'Попробуй ещё раз и удерживай позу ровнее.'}
              </Text>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.primary,
                  { backgroundColor: dance.accent },
                  pressed && { opacity: 0.88 },
                ]}
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
              {phase === 'holding' ? (
                <Text style={[styles.hold, { color: dance.accent }]}>
                  Держи {holdLeft}…
                </Text>
              ) : null}
              {phase === 'idle' ? (
                <Pressable
                  onPress={startHold}
                  style={({ pressed }) => [
                    styles.primary,
                    { backgroundColor: dance.accent },
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <Text style={styles.primaryText}>Начать удержание позы</Text>
                </Pressable>
              ) : null}
              {phase === 'between' ? (
                <Pressable
                  onPress={nextStep}
                  style={({ pressed }) => [
                    styles.primary,
                    { backgroundColor: colors.mint },
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <Text style={styles.primaryText}>
                    {stepIndex >= steps.length - 1
                      ? 'Завершить оценку'
                      : 'Следующая поза'}
                  </Text>
                </Pressable>
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
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(20,8,42,0.28)',
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 15,
    marginBottom: 6,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 18,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 24,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  copy: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginVertical: spacing.md,
  },
  link: {
    fontFamily: fonts.bodyBold,
    color: colors.sky,
    marginTop: spacing.md,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scoreBubble: {
    position: 'absolute',
    right: 8,
    top: 12,
    backgroundColor: 'rgba(20,8,42,0.82)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: fonts.brand,
    fontSize: 32,
    color: colors.gold,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepCount: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.sky,
  },
  cardTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 6,
  },
  cardCopy: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  hold: {
    fontFamily: fonts.bodyExtra,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  primary: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 16,
  },
});
