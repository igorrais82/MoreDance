import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonVideo } from '../../../src/components/LessonVideo';
import { StageBackground } from '../../../src/components/StageBackground';
import { Text } from '../../../src/components/Text';
import { CameraIcon, CheckIcon } from '../../../src/components/icons';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { getDanceVideo, getLessonMedia } from '../../../src/data/media';
import { getDanceImage } from '../../../src/data/danceImages';
import { withAlpha } from '../../../src/lib/color';
import { formatHold } from '../../../src/lib/frame';
import { colors, fonts, radius, spacing, type } from '../../../src/theme';
import { goBack } from '../../../src/lib/nav';

export default function LessonScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const media = getLessonMedia(lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeLesson, isLessonComplete, frameBestSeconds } = useProgress();

  if (!data) {
    return (
      <StageBackground>
        <View style={{ paddingTop: insets.top + 24, paddingHorizontal: 24 }}>
          <Text style={styles.title}>Урок не найден</Text>
          <Pressable
            onPress={() => goBack(router)}
            accessibilityRole="button"
            accessibilityLabel="Назад"
          >
            <Text style={styles.back}>← Назад</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  const { dance, lesson } = data;
  const accent = lesson.accent ?? dance.accent;
  const done = isLessonComplete(lesson.id);
  const videoSource = media?.videoSource ?? getDanceVideo(dance.id);

  /**
   * Основное действие урока повторяется внизу липкой панелью: раньше оно
   * пряталось после четырёх экранов текста, и до него никто не доскролливал.
   */
  const primary = lesson.runthrough
    ? {
        href: `/runthrough/${dance.id}/${lesson.id}`,
        title: 'Прогон под музыку',
        hint: 'Полторы минуты без остановок',
        colors: [colors.gold, '#FF9F1A'] as const,
      }
    : lesson.frameHold
      ? {
          href: `/frame/${dance.id}/${lesson.id}`,
          title: 'Держание рамы',
          hint: frameBestSeconds[lesson.id]
            ? `Рекорд ${formatHold(frameBestSeconds[lesson.id])}`
            : 'Таймер удержания',
          colors: [colors.sky, colors.blue] as const,
        }
      : {
          href: `/practice/${dance.id}/${lesson.id}`,
          title: 'Практика со счётом',
          hint: 'Метроном и шаги урока',
          colors: [colors.sky, colors.blue] as const,
        };

  return (
    <StageBackground>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => goBack(router)}
          accessibilityRole="button"
          accessibilityLabel={`Назад к танцу ${dance.name}`}
          style={styles.backBtn}
        >
          <Text style={styles.back}>← {dance.name}</Text>
        </Pressable>
        {videoSource != null ? (
          <LessonVideo
            label={`${dance.name} · демонстрация`}
            source={videoSource}
            poster={getDanceImage(dance.id)}
            startCollapsed
          />
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 108 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.en, { color: accent }]}>{dance.nameEn}</Text>
        <Text style={[styles.title, lesson.runthrough && { color: accent }]}>
          {lesson.title}
        </Text>
        <Text style={styles.meta}>
          {lesson.runthrough ? 'Прогон' : `Урок · ${lesson.durationMin} мин`} ·{' '}
          {lesson.bpm} BPM
          {frameBestSeconds[lesson.id]
            ? ` · рекорд удержания ${formatHold(frameBestSeconds[lesson.id])}`
            : ''}
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
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
            </View>
          </View>
        ))}

        <View style={styles.notes}>
          <Text style={styles.note}>
            Демонстрация в ролике — танец целиком, одна на все уроки танца.
            Фигуру этого урока ищи в шагах выше.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.sm },
        ]}
      >
        {!lesson.theory ? (
          <>
            <Pressable
              onPress={() => router.push(primary.href)}
              accessibilityRole="button"
              accessibilityLabel={`${primary.title}. ${primary.hint}`}
              style={({ pressed }) => [styles.primaryPress, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={[...primary.colors]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.primary}
              >
                <Text style={[styles.primaryTitle, { color: colors.bg }]}>
                  {primary.title}
                </Text>
                <Text style={[styles.primaryHint, { color: colors.bg }]}>
                  {primary.hint}
                </Text>
              </LinearGradient>
            </Pressable>
            {lesson.runthrough ? null : (
              <Pressable
                onPress={() => router.push(`/pose/${dance.id}/${lesson.id}`)}
                accessibilityRole="button"
                accessibilityLabel="Зеркало: потренировать позу"
                style={({ pressed }) => [
                  styles.iconAction,
                  { borderColor: accent },
                  pressed && styles.pressed,
                ]}
              >
                <CameraIcon size={22} color={accent} />
              </Pressable>
            )}
          </>
        ) : null}
        <Pressable
          onPress={async () => {
            await completeLesson(lesson.id);
          }}
          disabled={done}
          accessibilityRole="button"
          accessibilityLabel={
            done ? 'Урок уже отмечен выполненным' : 'Отметить урок выполненным, плюс три звезды'
          }
          style={({ pressed }) => [
            styles.iconAction,
            done && styles.iconActionDone,
            pressed && !done && styles.pressed,
          ]}
        >
          <CheckIcon size={22} color={done ? colors.mint : colors.ink} />
        </Pressable>
      </View>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    zIndex: 2,
    elevation: 4,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  back: {
    ...type.link,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1,
  },
  title: {
    ...type.screen,
    marginTop: 2,
    marginBottom: 2,
  },
  meta: {
    ...type.caption,
    marginBottom: spacing.sm,
  },
  summary: {
    ...type.bodyMuted,
    marginBottom: spacing.md,
  },
  tip: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.md,
    backgroundColor: colors.panel,
    marginBottom: spacing.lg,
    gap: 2,
  },
  tipLabel: {
    ...type.label,
    color: colors.gold,
  },
  tipText: {
    ...type.body,
  },
  section: {
    ...type.section,
    marginBottom: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  countBubble: {
    minWidth: 52,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 21,
    color: colors.bg,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    ...type.cardTitle,
    marginBottom: 2,
  },
  stepInstruction: {
    ...type.body,
  },
  notes: {
    marginTop: spacing.sm,
  },
  note: {
    ...type.caption,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.overlay,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  primaryPress: {
    flex: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  primary: {
    flex: 1,
    borderRadius: radius.card,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryTitle: {
    ...type.button,
    fontSize: 15,
    lineHeight: 20,
    color: colors.bg,
  },
  primaryHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.9,
  },
  iconAction: {
    width: 56,
    minHeight: 56,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionDone: {
    borderColor: colors.mint,
    backgroundColor: withAlpha(colors.mint, 0.16),
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
