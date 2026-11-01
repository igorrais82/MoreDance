import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonVideo } from '../../../src/components/LessonVideo';
import { StageBackground } from '../../../src/components/StageBackground';
import { Text } from '../../../src/components/Text';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { getDanceVideo, getLessonMedia } from '../../../src/data/media';
import { getDanceImage } from '../../../src/data/danceImages';
import { formatHold } from '../../../src/lib/frame';
import { colors, fonts, spacing } from '../../../src/theme';

export default function LessonScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const media = getLessonMedia(lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    completeLesson,
    isLessonComplete,
    poseBestScores,
    frameBestSeconds,
  } = useProgress();

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
  const accent = lesson.accent ?? dance.accent;
  const done = isLessonComplete(lesson.id);
  const videoSource = media?.videoSource ?? getDanceVideo(dance.id);

  return (
    <StageBackground>
      {/* Fixed player: does not move while steps/actions scroll. */}
      <View
        style={[
          styles.stickyPlayer,
          { paddingTop: insets.top + spacing.sm },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← {dance.name}</Text>
        </Pressable>
        {videoSource != null ? (
          <LessonVideo
            label={media?.videoLabel ?? dance.name}
            source={videoSource}
            poster={getDanceImage(dance.id)}
          />
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.en, { color: accent }]}>{dance.nameEn}</Text>
        <Text style={[styles.title, lesson.runthrough && { color: accent }]}>
          {lesson.title}
        </Text>
        <Text style={styles.summary}>{lesson.summary}</Text>

        <View style={[styles.tip, { borderColor: accent }]}>
          <Text style={styles.tipLabel}>Подсказка</Text>
          <Text style={styles.tipText}>{lesson.tip}</Text>
        </View>

        <Text style={styles.section}>
          {lesson.theory
            ? 'Материал'
            : lesson.runthrough
              ? 'Что танцуем'
              : lesson.frameHold
                ? 'Что проверить'
                : 'Шаги'}
        </Text>
        {lesson.steps.map((step, index) => (
          <View key={`${step.count}-${index}`} style={styles.step}>
            <View style={[styles.countBubble, { backgroundColor: accent }]}>
              <Text style={styles.countText}>{step.count}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
            </View>
          </View>
        ))}

        <View style={styles.actions}>
          {!lesson.theory ? (
            <>
              {lesson.runthrough ? (
                <Link href={`/runthrough/${dance.id}/${lesson.id}`} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPress,
                      pressed && styles.pressed,
                    ]}
                  >
                    <LinearGradient
                      colors={['#FFD84A', '#FF9F1A']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={[styles.actionButton, { borderColor: colors.gold }]}
                    >
                      <Text style={styles.actionTitle}>Прогон под музыку</Text>
                      <Text style={styles.actionHint}>
                        Полторы минуты под музыку без остановок
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Link>
              ) : lesson.frameHold ? (
                <Link href={`/frame/${dance.id}/${lesson.id}`} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPress,
                      pressed && styles.pressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.cyan, '#3D8BFF']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={[styles.actionButton, { borderColor: colors.cyan }]}
                    >
                      <Text style={styles.actionTitle}>
                        Держание рамы
                        {frameBestSeconds[lesson.id]
                          ? ` · рекорд ${formatHold(frameBestSeconds[lesson.id])}`
                          : ''}
                      </Text>
                      <Text style={styles.actionHint}>
                        Таймер удержания с оценкой результата
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Link>
              ) : (
                <Link href={`/practice/${dance.id}/${lesson.id}`} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPress,
                      pressed && styles.pressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.cyan, '#3D8BFF']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={[styles.actionButton, { borderColor: colors.cyan }]}
                    >
                      <Text style={styles.actionTitle}>Практика со счётом</Text>
                      <Text style={styles.actionHint}>Метроном и шаги урока</Text>
                    </LinearGradient>
                  </Pressable>
                </Link>
              )}

              {lesson.runthrough ? null : (
                <Link href={`/pose/${dance.id}/${lesson.id}`} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionPress,
                      pressed && styles.pressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.magenta, colors.coral]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={[styles.actionButton, { borderColor: colors.magenta }]}
                    >
                      <Text style={styles.actionTitle}>
                        Камера и оценка поз
                        {poseBestScores[lesson.id]
                          ? ` · ${poseBestScores[lesson.id]}%`
                          : ''}
                      </Text>
                      <Text style={styles.actionHint}>
                        Зеркало и тренировка позы
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Link>
              )}
            </>
          ) : null}

          <Pressable
            onPress={async () => {
              await completeLesson(lesson.id);
            }}
            style={({ pressed }) => [
              styles.secondary,
              done && styles.secondaryDone,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>
              {done ? '★ Урок отмечен' : 'Отметить урок выполненным (+3 ★)'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  stickyPlayer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 2,
    elevation: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backBtn: {
    marginBottom: spacing.sm,
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 15,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 20,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 30,
    color: colors.ink,
    marginTop: 4,
    marginBottom: 8,
  },
  summary: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  tip: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.panel,
  },
  tipLabel: {
    fontFamily: fonts.bodyExtra,
    color: colors.gold,
    fontSize: 13,
    marginBottom: 4,
  },
  tipText: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    fontFamily: fonts.brand,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  countBubble: {
    minWidth: 52,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  countText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 13,
    textAlign: 'center',
  },
  stepTitle: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 17,
    marginBottom: 4,
  },
  stepInstruction: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    marginTop: spacing.md,
    gap: 12,
  },
  actionPress: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.cyan,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  actionButton: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 17,
    textAlign: 'center',
  },
  actionHint: {
    fontFamily: fonts.body,
    color: 'rgba(247,251,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  secondary: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  secondaryDone: {
    borderColor: colors.mint,
    backgroundColor: 'rgba(46,230,197,0.12)',
  },
  secondaryText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 14,
  },
});
