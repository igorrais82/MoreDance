import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
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
import { getDanceImage } from '../../src/data/danceImages';
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
            <View style={styles.headlineBlock}>
              <Text style={styles.headline}>Спортивные бальные танцы</Text>
              <Text style={styles.headlineTag}>шаг за шагом</Text>
            </View>
            <Text style={styles.sub}>
              Привет, {dancerName}! Уровень {level} · {stars} ★
            </Text>
            <View style={styles.ctaRow}>
              {nextLesson ? (
                <Link
                  href={`/lesson/${nextLesson.danceId}/${nextLesson.lessonId}`}
                  asChild
                >
                  <Pressable
                    style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
                  >
                    <LinearGradient
                      colors={[colors.cyan, colors.magenta]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.ctaButton}
                    >
                      <Text style={styles.ctaText}>Продолжить урок</Text>
                    </LinearGradient>
                  </Pressable>
                </Link>
              ) : (
                <Link href="/dances" asChild>
                  <Pressable
                    style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
                  >
                    <LinearGradient
                      colors={[colors.cyan, colors.magenta]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.ctaButton}
                    >
                      <Text style={styles.ctaText}>Все танцы пройдены!</Text>
                    </LinearGradient>
                  </Pressable>
                </Link>
              )}
              <Link href="/dances" asChild>
                <Pressable
                  style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
                >
                  <LinearGradient
                    colors={[colors.cyan, colors.magenta]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.ctaButton}
                  >
                    <Text style={styles.ctaText}>Каталог</Text>
                  </LinearGradient>
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
            {dances.map((d) => {
              const image = getDanceImage(d.id);
              return (
                <Link key={d.id} href={`/dance/${d.id}`} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.chip,
                      { borderColor: d.accent },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.chipImageWrap, { borderColor: d.accent }]}>
                      {image ? (
                        <Image
                          source={image}
                          style={styles.chipImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.chipText, { color: d.accent }]}
                      numberOfLines={1}
                    >
                      {d.nameEn}
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
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
  headlineBlock: {
    marginTop: spacing.sm,
    maxWidth: 320,
    alignItems: 'center',
    gap: 4,
  },
  headline: {
    fontFamily: fonts.brand,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.8,
    color: colors.ink,
    textAlign: 'center',
  },
  headlineTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.gold,
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
    width: '100%',
    maxWidth: 340,
    gap: 12,
    alignItems: 'stretch',
  },
  ctaPress: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.magenta,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 17,
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
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
    justifyContent: 'center',
    gap: 12,
  },
  chip: {
    width: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: colors.panelSoft,
    gap: 8,
  },
  chipImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,8,42,0.55)',
  },
  chipImage: {
    width: 64,
    height: 64,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textAlign: 'center',
  },
});
