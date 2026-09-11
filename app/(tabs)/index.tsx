import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '../../src/components/BrandLogo';
import { StageBackground } from '../../src/components/StageBackground';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { colors, fonts, spacing } from '../../src/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { dancerName, stars, level, nextLesson, completedLessons } = useProgress();
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
    outputRange: [0.35, 0.7],
  });

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
            <BrandLogo size={248} style={styles.logo} />
            <Text style={styles.headline}>Спортивные бальные — шаг за шагом</Text>
            <Text style={styles.sub}>
              Привет, {dancerName}! Уровень {level} · {stars} ★
            </Text>
            <View style={styles.ctaRow}>
              {nextLesson ? (
                <Link
                  href={`/lesson/${nextLesson.danceId}/${nextLesson.lessonId}`}
                  asChild
                >
                  <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
                    <Text style={styles.ctaText}>Продолжить урок</Text>
                  </Pressable>
                </Link>
              ) : (
                <Link href="/dances" asChild>
                  <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
                    <Text style={styles.ctaText}>Все танцы пройдены!</Text>
                  </Pressable>
                </Link>
              )}
              <Link href="/dances" asChild>
                <Pressable
                  style={({ pressed }) => [styles.ctaGhost, pressed && styles.pressed]}
                >
                  <Text style={styles.ctaGhostText}>Каталог</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </Animated.View>

        {nextLesson ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Следующий шаг</Text>
            <LinearGradient
              colors={['rgba(0,245,255,0.22)', 'rgba(212,0,255,0.18)', 'rgba(28,16,64,0.95)']}
              style={styles.nextCard}
            >
              <Text style={styles.nextDance}>{nextLesson.danceName}</Text>
              <Text style={styles.nextLesson}>{nextLesson.title}</Text>
              <Text style={styles.nextHint}>
                Уроков пройдено: {completedLessons.length} из{' '}
                {dances.reduce((n, d) => n + d.lessons.length, 0)}
              </Text>
            </LinearGradient>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Программа</Text>
          <Text style={styles.sectionCopy}>
            Пять танцев · стандарт и латина · счёт, фигуры и практика под метроном.
          </Text>
          <View style={styles.chips}>
            {dances.map((d) => (
              <Link key={d.id} href={`/dance/${d.id}`} asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: d.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, { color: d.accent }]}>{d.nameEn}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  hero: {
    minHeight: 420,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  heroGlow: {
    position: 'absolute',
    top: 10,
    left: '8%',
    width: '84%',
    height: 260,
    borderRadius: 140,
    backgroundColor: colors.magenta,
  },
  logo: {
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(0,245,255,0.45)',
  },
  headline: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.ink,
    marginTop: spacing.sm,
    maxWidth: 320,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cta: {
    backgroundColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 16,
  },
  ctaGhost: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaGhostText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.88,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sectionCopy: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  nextCard: {
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  nextDance: {
    fontFamily: fonts.body,
    color: colors.gold,
    fontSize: 13,
    marginBottom: 4,
  },
  nextLesson: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 22,
    marginBottom: 8,
  },
  nextHint: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.panelSoft,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});
