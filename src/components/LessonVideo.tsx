import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme';

type Props = {
  label?: string;
  /** Local require('./file.mp4') */
  source: number;
};

const StableVideoSurface = memo(function StableVideoSurface({
  source,
}: {
  source: number;
}) {
  const started = useRef(false);
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    // Demo loops don't need audio by default — decoding A/V together
    // is a major cost on Android emulators and mid-range phones.
    p.muted = true;
    p.bufferOptions = {
      preferredForwardBufferDuration: 5,
      minBufferForPlayback: 1,
      prioritizeTimeOverSizeThreshold: true,
    };
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const timer = setTimeout(() => {
      try {
        player.currentTime = 0;
        player.play();
      } catch {
        // ignore
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [player]);

  // Pause when leaving the screen so decode doesn't keep burning CPU.
  useFocusEffect(
    useCallback(() => {
      try {
        player.play();
      } catch {
        // ignore
      }
      return () => {
        try {
          player.pause();
        } catch {
          // ignore
        }
      };
    }, [player]),
  );

  return (
    <VideoView
      style={styles.video}
      player={player}
      // SurfaceView is much cheaper than TextureView (GPU/CPU).
      // Keep this player outside ScrollView so SurfaceView doesn't flicker.
      surfaceType="surfaceView"
      contentFit="contain"
      nativeControls
      fullscreenOptions={{ enable: true }}
      playsInline
      allowsVideoFrameAnalysis={false}
    />
  );
});

/** Simple looping lesson/dance video player. */
export function LessonVideo({ label, source }: Props) {
  return (
    <View style={styles.wrap} collapsable={false}>
      <View style={styles.videoShell} collapsable={false}>
        <StableVideoSurface source={source} />
      </View>
      {label ? (
        <View style={styles.bar}>
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#000',
  },
  videoShell: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    zIndex: 1,
    elevation: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  bar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.panel,
  },
  label: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 15,
  },
});
