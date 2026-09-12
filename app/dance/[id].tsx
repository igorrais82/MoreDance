import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../../src/components/StageBackground';
import { LessonVideo } from '../../src/components/LessonVideo';
import { useProgress } from '../../src/context/ProgressContext';
import {
  difficultyLabel,
  getDance,
  styleLabel,
} from '../../src/data/dances';
import { getDanceVideo } from '../../src/data/media';
import { colors, fonts, spacing } from '../../src/theme';

export default function DanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dance = getDance(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLessonComplete, danceProgress } = useProgress();

  if (!dance) {
    return (
      <StageBackground>
        <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Танец не найден</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Назад</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  const progress = danceProgress(dance.id);

  return (
    <StageBackground>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Video stays outside ScrollView so Android SurfaceView stays smooth. */}
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + spacing.md },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← Назад</Text>
        </Pressable>

        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{dance.name}</Text>
        <Text style={styles.meta}>
          {styleLabel(dance.style)} · {difficultyLabel(dance.difficulty)} · {dance.bpm}{' '}
          BPM · {dance.timeSignature}
        </Text>

        {getDanceVideo(dance.id) != null ? (
          <LessonVideo
            label={dance.name}
            source={getDanceVideo(dance.id)!}
          />
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>{dance.description}</Text>
        <Text style={styles.love}>{dance.whyKidsLoveIt}</Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Прогресс: {progress.done}/{progress.total}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                  backgroundColor: dance.accent,
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.section}>Уроки</Text>
        {dance.lessons.map((lesson, index) => {
          const done = isLessonComplete(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${dance.id}/${lesson.id}`}
              asChild
            >
              <Pressable
                style={({ pressed }) => [
                  styles.lesson,
                  { borderColor: done ? colors.mint : colors.line },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <LinearGradient
                  colors={[colors.panel, `${dance.accent}22`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lessonInner}
                >
                  <View style={styles.lessonTop}>
                    <Text style={styles.lessonIndex}>Урок {index + 1}</Text>
                    <Text style={[styles.lessonBadge, done && { color: colors.mint }]}>
                      {done ? '★ Готово' : `${lesson.durationMin} мин`}
                    </Text>
                  </View>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonSummary}>{lesson.summary}</Text>
                </LinearGradient>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  fallback: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 15,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 22,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 32,
    color: colors.ink,
    marginTop: 4,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  love: {
    fontFamily: fonts.bodyBold,
    color: colors.gold,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  progressRow: {
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    marginBottom: 8,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  section: {
    fontFamily: fonts.brand,
    fontSize: 26,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  lesson: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  lessonInner: {
    padding: spacing.md,
  },
  lessonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lessonIndex: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  lessonBadge: {
    fontFamily: fonts.bodyBold,
    color: colors.sky,
    fontSize: 12,
  },
  lessonTitle: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 20,
    marginBottom: 4,
  },
  lessonSummary: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
