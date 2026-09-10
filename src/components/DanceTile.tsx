import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Dance,
  difficultyLabel,
  styleLabel,
} from '../data/dances';
import { colors, fonts, spacing } from '../theme';

type Props = {
  dance: Dance;
  progress: { done: number; total: number };
};

export function DanceTile({ dance, progress }: Props) {
  const ratio = progress.total ? progress.done / progress.total : 0;

  return (
    <Link href={`/dance/${dance.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
        <LinearGradient
          colors={[`${dance.accent}33`, 'rgba(18,35,58,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <View style={styles.topRow}>
            <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
            <Text style={styles.meta}>
              {styleLabel(dance.style)} · {difficultyLabel(dance.difficulty)}
            </Text>
          </View>
          <Text style={styles.name}>{dance.name}</Text>
          <Text style={styles.mood}>{dance.mood}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.round(ratio * 100)}%`, backgroundColor: dance.accent },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.done}/{progress.total} уроков
          </Text>
        </LinearGradient>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  press: {
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  tile: {
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 18,
    letterSpacing: 1,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  name: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 24,
    marginBottom: 4,
  },
  mood: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(244,247,251,0.12)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 13,
  },
});
