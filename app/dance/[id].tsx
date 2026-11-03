import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented } from '../../src/components/Chip';
import { LessonVideo } from '../../src/components/LessonVideo';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { useProgress } from '../../src/context/ProgressContext';
import { difficultyLabel, getDance, styleLabel } from '../../src/data/dances';
import { getDanceVideo } from '../../src/data/media';
import { getDanceImage } from '../../src/data/danceImages';
import { withAlpha } from '../../src/lib/color';
import { colors, fonts, radius, spacing, type } from '../../src/theme';
import { goBack } from '../../src/lib/nav';

type DanceView = 'lessons' | 'about';

export default function DanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dance = getDance(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLessonComplete, danceProgress } = useProgress();
  const [view, setView] = useState<DanceView>('lessons');

  if (!dance) {
    return (
      <StageBackground>
        <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Танец не найден</Text>
          <Pressable onPress={() => goBack(router)} accessibilityRole="button" accessibilityLabel="Назад">
            <Text style={styles.back}>← Назад</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  const progress = danceProgress(dance.id);
  const percent = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  /**
   * Номер урока для карточки. Прогон в нумерацию не входит (он рисуется как
   * «Прогон»), поэтому уроки после него продолжают счёт без пропусков.
   */
  const lessonNumbers = new Map<string, number>();
  dance.lessons.forEach((lesson) => {
    if (!lesson.runthrough) lessonNumbers.set(lesson.id, lessonNumbers.size + 1);
  });
  const firstUndone = dance.lessons.find((lesson) => !isLessonComplete(lesson.id));

  return (
    <StageBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => goBack(router)}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          style={styles.backBtn}
        >
          <Text style={styles.back}>← Назад</Text>
        </Pressable>
        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{dance.name}</Text>
        <Text style={styles.meta}>
          {styleLabel(dance.style)} · {difficultyLabel(dance.difficulty)} · {dance.bpm}{' '}
          BPM · {dance.timeSignature}
        </Text>
        <Segmented
          options={[
            { key: 'lessons' as const, label: `Уроки · ${progress.done}/${progress.total}` },
            { key: 'about' as const, label: 'О танце' },
          ]}
          value={view}
          onChange={setView}
          accent={dance.accent}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {view === 'lessons' ? (
          <>
            <View style={styles.progressRow}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${percent}%`, backgroundColor: dance.accent },
                  ]}
                />
              </View>
            </View>

            {dance.lessons.map((lesson) => {
              const done = isLessonComplete(lesson.id);
              const accent = lesson.accent ?? dance.accent;
              const special = lesson.runthrough === true;
              const number = lessonNumbers.get(lesson.id);
              const current = firstUndone?.id === lesson.id;
              return (
                <Pressable
                  key={lesson.id}
                  onPress={() => router.push(`/lesson/${dance.id}/${lesson.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${special ? 'Прогон' : `Урок ${number}`}: ${lesson.title}${done ? ', пройден' : ''}`}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View
                    style={[
                      styles.lesson,
                      done && styles.lessonDone,
                      current && styles.lessonCurrent,
                    ]}
                  >
                    <View
                      style={[
                        styles.stripe,
                        {
                          backgroundColor: done
                            ? colors.mint
                            : special
                              ? colors.gold
                              : accent,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.badge,
                        special
                          ? { backgroundColor: withAlpha(colors.gold, 0.18) }
                          : { backgroundColor: withAlpha(accent, 0.16) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: special ? colors.gold : accent },
                        ]}
                      >
                        {special ? '★' : number}
                      </Text>
                    </View>
                    <View style={styles.lessonBody}>
                      <View style={styles.lessonTop}>
                        <Text style={styles.lessonTitle} numberOfLines={2}>
                          {special && !lesson.title.startsWith('Прогон')
                            ? `Прогон: ${lesson.title}`
                            : lesson.title}
                        </Text>
                        <Text
                          style={[styles.lessonMeta, done && { color: colors.mint }]}
                        >
                          {done ? '✓ Пройден' : `${lesson.durationMin} мин`}
                        </Text>
                      </View>
                      <Text style={styles.lessonSummary} numberOfLines={2}>
                        {lesson.summary}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          <>
            {getDanceVideo(dance.id) != null ? (
              <View style={styles.playerBlock}>
                <LessonVideo
                  label={`${dance.name} · демонстрация`}
                  source={getDanceVideo(dance.id)!}
                  poster={getDanceImage(dance.id)}
                />
              </View>
            ) : null}

            <Text style={[styles.aboutLabel, { color: dance.accent }]}>История</Text>
            <Text style={styles.aboutText}>{dance.history}</Text>

            <Text style={[styles.aboutLabel, { color: dance.accent }]}>Характер</Text>
            <Text style={styles.aboutText}>{dance.character}</Text>

            <View style={[styles.factCard, { borderColor: dance.accent }]}>
              <Text style={styles.factLabel}>Научный факт</Text>
              <Text style={styles.factText}>{dance.scienceFact}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    zIndex: 2,
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
  },
  back: {
    ...type.link,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1,
  },
  title: {
    ...type.title,
  },
  meta: {
    ...type.small,
    marginBottom: spacing.xs,
  },
  playerBlock: {
    marginBottom: spacing.lg,
  },
  aboutLabel: {
    ...type.label,
    marginBottom: 2,
  },
  aboutText: {
    ...type.body,
    marginBottom: spacing.md,
  },
  factCard: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.md,
    backgroundColor: colors.panel,
  },
  factLabel: {
    ...type.label,
    color: colors.gold,
    marginBottom: 2,
  },
  factText: {
    ...type.body,
  },
  progressRow: {
    marginBottom: spacing.md,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  lessonDone: {
    borderColor: withAlpha(colors.mint, 0.45),
  },
  lessonCurrent: {
    borderColor: colors.lineStrong,
  },
  stripe: {
    alignSelf: 'stretch',
    width: 3,
    borderRadius: 2,
    marginVertical: 2,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
  },
  lessonBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  lessonTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  lessonTitle: {
    ...type.cardTitle,
    flex: 1,
  },
  lessonMeta: {
    ...type.caption,
  },
  lessonSummary: {
    ...type.small,
  },
  pressed: {
    opacity: 0.9,
  },
});
