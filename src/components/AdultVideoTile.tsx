import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { AdultVideo } from '../data/adultGroup';
import { colors, fonts, spacing } from '../theme';

type Props = {
  video: AdultVideo;
  index: number;
};

/** Карточка ролика взрослой группы: превью 16:9 + название и кто танцует. */
export function AdultVideoTile({ video, index }: Props) {
  return (
    <Link href={`/adult/${video.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
        <LinearGradient
          colors={['rgba(0,245,255,0.16)', 'rgba(212,0,255,0.12)', colors.panel]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <View style={styles.posterWrap}>
            {video.poster != null ? (
              <Image source={video.poster} style={styles.poster} resizeMode="cover" />
            ) : (
              <View style={styles.posterFallback}>
                <Text style={styles.posterGlyph}>▶</Text>
                <Text style={styles.posterStyle}>{video.style}</Text>
              </View>
            )}
            <View style={styles.playBadge}>
              <Text style={styles.playBadgeText}>▶</Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.style}>{video.style}</Text>
              <Text style={styles.counter}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.title}>{video.title}</Text>
            {video.dancers ? (
              <Text style={styles.dancers} numberOfLines={1}>
                {video.dancers}
              </Text>
            ) : null}
          </View>
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
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  posterWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(10, 47, 68, 0.6)',
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
    gap: 6,
  },
  posterGlyph: {
    fontSize: 34,
    color: colors.cyan,
    opacity: 0.85,
  },
  posterStyle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  playBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 8, 42, 0.78)',
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  playBadgeText: {
    color: colors.cyan,
    fontSize: 15,
    marginLeft: 2,
  },
  body: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  style: {
    fontFamily: fonts.brand,
    fontSize: 17,
    letterSpacing: 1,
    color: colors.cyan,
  },
  counter: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 21,
    color: colors.ink,
    marginBottom: 2,
  },
  dancers: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
  },
});
