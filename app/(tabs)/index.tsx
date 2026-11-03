import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '../../src/components/BrandLogo';
import { Segmented } from '../../src/components/Chip';
import { PerformancesList } from '../../src/components/PerformancesList';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { GearIcon } from '../../src/components/icons';
import { useDancer } from '../../src/context/DancerContext';
import { useParent } from '../../src/context/ParentContext';
import { useProgress } from '../../src/context/ProgressContext';
import { useSettings } from '../../src/context/SettingsContext';
import { withAlpha } from '../../src/lib/color';
import { plural } from '../../src/lib/plural';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [view, setView] = useState<'scene' | 'performances'>('scene');
  const {
    dancerName,
    stars,
    rank,
    nextLesson,
    completedLessons,
    todayPracticeSeconds,
    streakDays,
    totalLessons,
  } = useProgress();
  const dancer = useDancer();
  const parent = useParent();
  const { palettes, activeTab } = useSettings();
  const accent = (palettes[activeTab] ?? palettes.index).from;
  const greeting = dancer.firstName || dancerName;
  const glow = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rise, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [glow, rise]);

  const spotlightOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const goalSeconds = Math.max(parent.dailyGoalMinutes, 1) * 60;
  const todayRatio = Math.min(1, todayPracticeSeconds / goalSeconds);
  const todayMinutes = Math.floor(todayPracticeSeconds / 60);

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 72,
            // Полоса под плавающей панелью: контент не уезжает под вкладки.
            paddingBottom: insets.bottom + 108,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.segments}>
          <Segmented
            options={[
              { key: 'scene' as const, label: 'Сцена' },
              { key: 'performances' as const, label: 'Афиша' },
            ]}
            value={view}
            onChange={setView}
            accent={accent}
          />
        </View>

        {view === 'performances' ? (
          <PerformancesList />
        ) : (
          <>
            <Animated.View
              style={{
                opacity: rise,
                transform: [
                  {
                    translateY: rise.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              }}
            >
              <View style={styles.hero}>
                <Animated.View style={[styles.heroGlow, { opacity: spotlightOpacity }]} />
                <BrandLogo size={172} style={styles.logo} />
                <View style={styles.headlineBlock}>
                  <Text style={styles.headline}>Спортивные бальные танцы</Text>
                  <Text style={styles.headlineTag}>шаг за шагом</Text>
                </View>
                <Text style={styles.sub}>
                  Привет, {greeting}! {rank.title} · {stars} ★
                </Text>
                <View style={styles.ctaRow}>
                  {nextLesson ? (
                    <Pressable
                      onPress={() =>
                        router.push(`/lesson/${nextLesson.danceId}/${nextLesson.lessonId}`)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Продолжить урок: ${nextLesson.title}`}
                      style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
                    >
                      <LinearGradient
                        colors={[accent, colors.magenta]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.ctaButton}
                      >
                        <Text style={styles.ctaText}>Продолжить урок</Text>
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => router.push('/dances')}
                      accessibilityRole="button"
                      accessibilityLabel="Все танцы пройдены, открыть каталог"
                      style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
                    >
                      <LinearGradient
                        colors={[accent, colors.magenta]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.ctaButton}
                      >
                        <Text style={styles.ctaText}>Все танцы пройдены!</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => router.push('/dances')}
                    accessibilityRole="button"
                    accessibilityLabel="Открыть каталог танцев"
                    style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
                  >
                    <View style={styles.ctaGhost}>
                      <Text style={[styles.ctaText, styles.ctaGhostText]}>
                        Каталог
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </Animated.View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Сегодня</Text>
              <LinearGradient
                colors={[withAlpha(accent, 0.16), colors.panel]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.todayCard}
              >
                <View style={styles.todayTop}>
                  <Text style={styles.todayValue}>
                    {todayMinutes} / {parent.dailyGoalMinutes} мин
                  </Text>
                  <Text style={styles.streak} accessibilityLabel={`${streakDays} дней практики подряд`}>
                    {streakDays > 0
                      ? `🔥 ${streakDays} ${plural(streakDays, 'день', 'дня', 'дней')} подряд`
                      : '🔥 начни серию'}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.round(todayRatio * 100)}%`, backgroundColor: accent },
                    ]}
                  />
                </View>
                <Text style={styles.todayHint}>
                  {todayRatio >= 1
                    ? 'Цель дня выполнена — можно танцевать дальше для удовольствия.'
                    : 'Посчитай под метроном или встань к зеркалу — минуты пойдут в цель.'}
                </Text>
              </LinearGradient>
            </View>

            {nextLesson ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Следующий шаг</Text>
                <Pressable
                  onPress={() =>
                    router.push(`/lesson/${nextLesson.danceId}/${nextLesson.lessonId}`)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Открыть урок ${nextLesson.title}`}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <LinearGradient
                    colors={[withAlpha(accent, 0.18), colors.panel]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nextCard}
                  >
                    <Text style={styles.nextDance}>{nextLesson.danceName}</Text>
                    <Text style={styles.nextLesson}>{nextLesson.title}</Text>
                    <Text style={styles.nextHint}>
                      Уроков пройдено: {completedLessons.length} из {totalLessons} · открыть →
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="Настройки"
        hitSlop={12}
        style={({ pressed }) => [
          styles.gear,
          { top: insets.top + 6 },
          pressed && styles.gearPressed,
        ]}
      >
        <View style={styles.gearPlate}>
          <GearIcon size={24} color={colors.ink} />
        </View>
      </Pressable>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  segments: {
    marginBottom: spacing.md,
  },
  gear: {
    position: 'absolute',
    right: spacing.md,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  gearPlate: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
  },
  heroGlow: {
    position: 'absolute',
    top: 6,
    left: '22%',
    width: '56%',
    height: 168,
    borderRadius: 120,
    backgroundColor: colors.magenta,
  },
  logo: {
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  headlineBlock: {
    marginTop: spacing.xs,
    maxWidth: 320,
    alignItems: 'center',
    gap: 2,
  },
  headline: {
    ...type.title,
    textAlign: 'center',
  },
  headlineTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.gold,
    textAlign: 'center',
  },
  sub: {
    ...type.bodyMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  ctaRow: {
    width: '100%',
    maxWidth: 320,
    gap: 10,
    alignItems: 'stretch',
  },
  ctaPress: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  ctaButton: {
    minHeight: 50,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaGhost: {
    minHeight: 50,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaText: {
    ...type.button,
  },
  ctaGhostText: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...type.section,
    marginBottom: spacing.sm,
  },
  todayCard: {
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.xs,
  },
  todayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  todayValue: {
    ...type.cardTitle,
  },
  streak: {
    ...type.caption,
    color: colors.gold,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  todayHint: {
    ...type.caption,
  },
  nextCard: {
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  nextDance: {
    ...type.label,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  nextLesson: {
    ...type.section,
    marginBottom: spacing.xs,
  },
  nextHint: {
    ...type.caption,
  },
});
