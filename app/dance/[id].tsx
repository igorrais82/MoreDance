import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { LessonVideo } from '../../src/components/LessonVideo';
import { useProgress } from '../../src/context/ProgressContext';
import {
  difficultyLabel,
  getDance,
  styleLabel,
} from '../../src/data/dances';
import { getDanceVideo } from '../../src/data/media';
import { getDanceImage } from '../../src/data/danceImages';
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

  /**
   * Номер урока для карточки. Прогон в нумерацию не входит (он рисуется как
   * «★ Прогон»), поэтому уроки после него продолжают счёт без пропусков.
   */
  const lessonNumbers = new Map<string, number>();
  dance.lessons.forEach((lesson) => {
    if (!lesson.runthrough) lessonNumbers.set(lesson.id, lessonNumbers.size + 1);
  });

  return (
    <StageBackground>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Fixed player: does not move while the lesson list scrolls. */}
      <View
        style={[
          styles.stickyPlayer,
          { paddingTop: insets.top + spacing.sm },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← Назад</Text>
        </Pressable>
        {getDanceVideo(dance.id) != null ? (
          <LessonVideo
            label={dance.name}
            source={getDanceVideo(dance.id)!}
            poster={getDanceImage(dance.id)}
          />
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{dance.name}</Text>
        <Text style={styles.meta}>
          {styleLabel(dance.style)} · {difficultyLabel(dance.difficulty)} · {dance.bpm}{' '}
          BPM · {dance.timeSignature}
        </Text>
        <View style={styles.about}>
          <Text style={[styles.aboutLabel, { color: dance.accent }]}>
            История
          </Text>
          <Text style={styles.aboutText}>{dance.history}</Text>

          <Text style={[styles.aboutLabel, { color: dance.accent }]}>
            Характер
          </Text>
          <Text style={styles.aboutText}>{dance.character}</Text>

          <View style={[styles.factCard, { borderColor: dance.accent }]}>
            <Text style={styles.factLabel}>Научный факт</Text>
            <Text style={styles.factText}>{dance.scienceFact}</Text>
          </View>
        </View>

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
        {dance.lessons.map((lesson) => {
          const done = isLessonComplete(lesson.id);
          const accent = lesson.accent ?? dance.accent;
          const special = lesson.runthrough === true;
          const number = lessonNumbers.get(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${dance.id}/${lesson.id}`}
              asChild
            >
              <Pressable
                style={({ pressed }) => [
                  styles.lesson,
                  {
                    borderColor: done
                      ? colors.mint
                      : special
                        ? accent
                        : colors.line,
                    borderWidth: special ? 2 : 1,
                  },
                  special && styles.lessonSpecial,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <LinearGradient
                  colors={
                    special
                      ? ['rgba(255,216,74,0.16)', 'rgba(255,216,74,0.04)']
                      : [colors.panel, `${accent}22`]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lessonInner}
                >
                  <View style={styles.lessonTop}>
                    <Text
                      style={[
                        styles.lessonIndex,
                        special && [styles.lessonIndexSpecial, { color: accent }],
                      ]}
                    >
                      {special ? '★ Прогон' : `Урок ${number}`}
                    </Text>
                    <Text
                      style={[
                        styles.lessonBadge,
                        { color: accent },
                        done && { color: colors.mint },
                      ]}
                    >
                      {done ? '★ Готово' : `${lesson.durationMin} мин`}
                    </Text>
                  </View>
                  <Text
                    style={[styles.lessonTitle, special && { color: accent }]}
                  >
                    {lesson.title}
                  </Text>
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
  fallback: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
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
  about: {
    marginBottom: spacing.lg,
  },
  aboutLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  aboutText: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  factCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.panel,
  },
  factLabel: {
    fontFamily: fonts.bodyExtra,
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  factText: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
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
  lessonSpecial: {
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
  lessonIndexSpecial: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 0.6,
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
