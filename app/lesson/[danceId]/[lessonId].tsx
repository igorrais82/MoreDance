import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonVideo } from '../../../src/components/LessonVideo';
import { StageBackground } from '../../../src/components/StageBackground';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { getLessonMedia } from '../../../src/data/media';
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
  const { completeLesson, isLessonComplete, poseBestScores } = useProgress();

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
  const done = isLessonComplete(lesson.id);

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← {dance.name}</Text>
        </Pressable>

        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.summary}>{lesson.summary}</Text>

        {media ? (
          <LessonVideo
            url={media.videoUrl}
            label={media.videoLabel}
            accent={dance.accent}
          />
        ) : null}

        <View style={[styles.tip, { borderColor: dance.accent }]}>
          <Text style={styles.tipLabel}>Подсказка</Text>
          <Text style={styles.tipText}>{lesson.tip}</Text>
        </View>

        <Text style={styles.section}>Шаги</Text>
        {lesson.steps.map((step, index) => (
          <View key={`${step.count}-${index}`} style={styles.step}>
            <View style={[styles.countBubble, { backgroundColor: dance.accent }]}>
              <Text style={styles.countText}>{step.count}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
            </View>
          </View>
        ))}

        <View style={styles.actions}>
          <Link href={`/practice/${dance.id}/${lesson.id}`} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: dance.accent },
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.primaryText}>Практика со счётом</Text>
            </Pressable>
          </Link>

          <Link href={`/pose/${dance.id}/${lesson.id}`} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: colors.coral },
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.primaryText}>
                Камера и оценка поз
                {poseBestScores[lesson.id]
                  ? ` · лучший ${poseBestScores[lesson.id]}%`
                  : ''}
              </Text>
            </Pressable>
          </Link>

          <Pressable
            onPress={async () => {
              await completeLesson(lesson.id);
            }}
            style={({ pressed }) => [
              styles.secondary,
              done && styles.secondaryDone,
              pressed && { opacity: 0.88 },
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
  content: {
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    marginBottom: spacing.md,
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
    backgroundColor: 'rgba(18,35,58,0.85)',
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
    gap: 10,
  },
  primary: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 16,
  },
  secondary: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  secondaryDone: {
    borderColor: colors.mint,
    backgroundColor: 'rgba(62,207,142,0.12)',
  },
  secondaryText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 14,
  },
});
