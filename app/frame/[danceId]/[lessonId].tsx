import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../../../src/components/StageBackground';
import { Text } from '../../../src/components/Text';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import {
  FRAME_GOOD_SECONDS,
  formatHold,
  frameRating,
} from '../../../src/lib/frame';
import { colors, fonts, spacing } from '../../../src/theme';

/**
 * «Держание рамы»: таймер, который копит время, пока руки стоят в закрытой
 * раме. Опустил руки - пауза, и приложение показывает результат с оценкой.
 */
export default function FrameHoldScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    completeLesson,
    isLessonComplete,
    frameBestSeconds,
    recordFrameHold,
  } = useProgress();

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const accrued = useRef(0);
  const bestAtStart = useRef(0);
  const recordFrameHoldRef = useRef(recordFrameHold);
  recordFrameHoldRef.current = recordFrameHold;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startedAt.current != null) {
        setElapsed(
          accrued.current + Math.floor((Date.now() - startedAt.current) / 1000),
        );
      }
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  if (!data) {
    return (
      <StageBackground>
        <View style={{ paddingTop: insets.top + 24, paddingHorizontal: 24 }}>
          <Text style={styles.title}>Урок не найден</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Назад</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  const { dance, lesson } = data;
  const best = frameBestSeconds[lesson.id] ?? 0;
  const done = isLessonComplete(lesson.id);
  const rating = result != null ? frameRating(result) : null;
  const isRecord = result != null && result > bestAtStart.current;

  const start = () => {
    // Каждая попытка считается с нуля: «Продолжить» - это новый подход,
    // а не накопление времени поверх предыдущего результата.
    bestAtStart.current = best;
    accrued.current = 0;
    startedAt.current = Date.now();
    setElapsed(0);
    setResult(null);
    setRunning(true);
  };

  const pause = () => {
    if (startedAt.current == null) return;
    const total =
      accrued.current +
      Math.floor((Date.now() - startedAt.current) / 1000);
    accrued.current = total;
    startedAt.current = null;
    setRunning(false);
    setElapsed(total);
    setResult(total);

    if (total > 0) {
      recordFrameHoldRef.current(lesson.id, total).catch(() => undefined);
    }
    Haptics.notificationAsync(
      total >= FRAME_GOOD_SECONDS
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => undefined);
    if (total >= FRAME_GOOD_SECONDS && !done) {
      completeLesson(lesson.id).catch(() => undefined);
    }
  };

  const reset = () => {
    startedAt.current = null;
    accrued.current = 0;
    setRunning(false);
    setElapsed(0);
    setResult(null);
  };

  return (
    <StageBackground>
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.back}>← К уроку</Text>
          </Pressable>

          <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
          <Text style={styles.title}>Держание рамы</Text>
          <Text style={styles.subtitle}>{lesson.title}</Text>

          <View style={[styles.timerCard, { borderColor: dance.accent }]}>
            <Text style={styles.timer}>{formatHold(elapsed)}</Text>
            <Text style={styles.timerHint}>
              {running
                ? 'Держи раму: плечи вниз, локти не провисают'
                : result != null
                  ? `Результат: ${formatHold(result)} - отдыхай и повторяй`
                  : 'Нажми «Держать раму» и включи таймер'}
            </Text>
          </View>

          <Pressable
            onPress={running ? pause : start}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: running ? colors.magenta : dance.accent,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={styles.primaryText}>
              {running ? 'Пауза' : result != null ? 'Ещё раз' : 'Держать раму'}
            </Text>
          </Pressable>

          {rating ? (
            <View style={[styles.ratingCard, { borderColor: rating.accent }]}>
              <View style={styles.ratingTop}>
                <Text style={[styles.ratingLabel, { color: rating.accent }]}>
                  {rating.label}
                </Text>
                <Text style={styles.ratingTime}>{formatHold(result ?? 0)}</Text>
              </View>
              <Text style={styles.ratingHint}>{rating.hint}</Text>
              {isRecord ? (
                <Text style={styles.record}>★ Новый рекорд</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.howCard}>
            <Text style={styles.howTitle}>Как тренироваться</Text>
            <Text style={styles.howText}>
              Построй раму по шагам урока и включи таймер. Держи руки
              неподвижно, дыши ровно. Опустил руки, ссутулился или поднял
              плечи - сразу жми «Пауза»: приложение покажет удержанное время и
              оценку.
            </Text>
            <Text style={styles.howText}>
              Меньше 10 секунд - «мало», от 30 секунд - уже зачётный результат,
              а две-три минуты - «отлично» и «блестяще».
            </Text>
            {best > 0 ? (
              <Text style={[styles.best, { color: dance.accent }]}>
                Лучший результат: {formatHold(best)}
              </Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            {elapsed > 0 && !running ? (
              <Pressable
                onPress={reset}
                style={({ pressed }) => [
                  styles.ghostBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.ghostText}>Сбросить таймер</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => completeLesson(lesson.id)}
              style={({ pressed }) => [
                styles.doneBtn,
                done && styles.doneBtnDone,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.doneText}>
                {done ? '★ Урок отмечен' : 'Отметить урок выполненным (+3 ★)'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backBtn: {
    marginBottom: 2,
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 15,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 18,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    marginTop: -4,
  },
  timerCard: {
    borderWidth: 2,
    borderRadius: 24,
    backgroundColor: colors.panel,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  timer: {
    fontFamily: fonts.brand,
    fontSize: 72,
    lineHeight: 78,
    color: colors.gold,
  },
  timerHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 18,
  },
  ratingCard: {
    borderWidth: 2,
    borderRadius: 18,
    backgroundColor: colors.panelSoft,
    padding: spacing.md,
    gap: 6,
  },
  ratingTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 24,
  },
  ratingTime: {
    fontFamily: fonts.brand,
    fontSize: 26,
    color: colors.ink,
  },
  ratingHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  record: {
    fontFamily: fonts.bodyExtra,
    fontSize: 14,
    color: colors.gold,
  },
  howCard: {
    backgroundColor: colors.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    gap: 8,
  },
  howTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 16,
    color: colors.ink,
  },
  howText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  best: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  actions: {
    gap: 10,
  },
  ghostBtn: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 15,
  },
  doneBtn: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnDone: {
    backgroundColor: colors.mint,
  },
  doneText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 15,
  },
});
