import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { withAlpha } from '../lib/color';
import { colors, fonts, radius, spacing, type } from '../theme';

type Props = {
  /** Куда ведёт карточка, например `/adult/hiphop-01`. */
  href: string;
  title: string;
  label: string;
  subtitle?: string;
  poster?: number;
  index: number;
};

/** Универсальная карточка ролика: превью 16:9, подпись, название. */
export function VideoTile({ href, title, label, subtitle, poster, index }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${title}`}
      style={({ pressed }) => [styles.press, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[withAlpha(colors.sky, 0.14), withAlpha(colors.magenta, 0.1), colors.panel]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tile}
      >
        <View style={styles.posterWrap}>
          {poster != null ? (
            <Image source={poster} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.posterFallback}>
              <Text style={styles.posterGlyph}>▶</Text>
              <Text style={styles.posterLabel}>{label}</Text>
            </View>
          )}
          <View style={styles.playBadge}>
            <Text style={styles.playBadgeText}>▶</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.counter}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
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
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  posterWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.panelSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  posterGlyph: {
    fontSize: 28,
    color: colors.muted,
  },
  posterLabel: {
    ...type.label,
  },
  playBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  playBadgeText: {
    color: colors.ink,
    fontSize: 13,
    marginLeft: 2,
  },
  body: {
    padding: spacing.md,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  label: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1,
    color: colors.sky,
  },
  counter: {
    ...type.caption,
  },
  title: {
    ...type.cardTitle,
    fontSize: 19,
    lineHeight: 25,
  },
  subtitle: {
    ...type.caption,
  },
});
