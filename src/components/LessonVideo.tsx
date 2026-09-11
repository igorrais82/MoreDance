import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme';

type Props = {
  url: string;
  label: string;
  accent?: string;
};

export function LessonVideo({ url, label, accent = colors.gold }: Props) {
  const [started, setStarted] = useState(false);
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });

  if (!started) {
    return (
      <Pressable
        onPress={() => {
          setStarted(true);
          player.play();
        }}
        style={({ pressed }) => [
          styles.poster,
          { borderColor: accent },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={[styles.play, { color: accent }]}>▶</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.hint}>Видеоурок · нажми, чтобы смотреть</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <VideoView
        style={styles.video}
        player={player}
        fullscreenOptions={{ enable: true }}
        contentFit="cover"
        nativeControls
      />
      <View style={styles.bar}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          onPress={() => {
            if (player.playing) player.pause();
            else player.play();
          }}
        >
          <Text style={[styles.toggle, { color: accent }]}>
            {player.playing ? 'Пауза' : 'Смотреть'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  poster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.panel,
    marginBottom: spacing.md,
  },
  play: {
    fontSize: 28,
    width: 44,
    textAlign: 'center',
  },
  wrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 200,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.panel,
  },
  label: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 15,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  toggle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
});
