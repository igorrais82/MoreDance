import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { getDanceImage } from '../data/danceImages';
import {
  Dance,
  difficultyLabel,
  styleLabel,
} from '../data/dances';
import { withAlpha } from '../lib/color';
import { colors, fonts, radius, spacing, type } from '../theme';

type Props = {
  dance: Dance;
  progress: { done: number; total: number };
};

export function DanceTile({ dance, progress }: Props) {
  const router = useRouter();
  const ratio = progress.total ? progress.done / progress.total : 0;
  const image = getDanceImage(dance.id);

  return (
    <Pressable
      onPress={() => router.push(`/dance/${dance.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${dance.name}: ${progress.done} из ${progress.total} уроков`}
      style={({ pressed }) => [styles.press, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[withAlpha(dance.accent, 0.18), colors.panel]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tile}
      >
        <View style={styles.headerRow}>
          {image ? <Image source={image} style={styles.thumb} /> : null}
          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
              <Text style={styles.meta}>
                {styleLabel(dance.style)} · {difficultyLabel(dance.difficulty)}
              </Text>
            </View>
            <Text style={styles.name}>{dance.name}</Text>
            <Text style={styles.mood}>{dance.mood}</Text>
          </View>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.round(ratio * 100)}%`,
                backgroundColor: dance.accent,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress.done}/{progress.total} уроков
        </Text>
      </LinearGradient>
    </Pressable>
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
    borderRadius: radius.tile,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: radius.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    gap: spacing.xs,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1,
  },
  meta: {
    ...type.caption,
  },
  name: {
    ...type.cardTitle,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 1,
  },
  mood: {
    ...type.small,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...type.caption,
    color: colors.ink,
  },
});
