import {
  setAudioModeAsync,
  useAudioPlayer,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts, spacing } from '../theme';

const tickSound = require('../../assets/sounds/tick.wav');
const accentSound = require('../../assets/sounds/tick-accent.wav');

type Props = {
  bpm: number;
  counts: string[];
  accent?: string;
  running: boolean;
  onToggle: () => void;
  onTick?: () => void;
};

export function Metronome({
  bpm,
  counts,
  accent = colors.gold,
  running,
  onToggle,
  onTick,
}: Props) {
  const [beat, setBeat] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const tickPlayer = useAudioPlayer(tickSound);
  const accentPlayer = useAudioPlayer(accentSound);
  const tickPlayerRef = useRef(tickPlayer);
  const accentPlayerRef = useRef(accentPlayer);
  tickPlayerRef.current = tickPlayer;
  accentPlayerRef.current = accentPlayer;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    // Classic metronome balance: quieter tocks, stronger first beat
    tickPlayer.volume = 0.62;
    accentPlayer.volume = 1;
  }, [tickPlayer, accentPlayer]);

  useEffect(() => {
    if (!running) return;

    const intervalMs = Math.max(200, Math.round(60000 / bpm));
    let current = 0;
    setBeat(0);

    const pulse = (index: number) => {
      const player =
        index === 0 ? accentPlayerRef.current : tickPlayerRef.current;
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // ignore playback races
      }
      Haptics.impactAsync(
        index === 0
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      ).catch(() => undefined);
      scale.setValue(1.18);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();
    };

    // Opening click for the first count shown
    pulse(0);

    const id = setInterval(() => {
      current = (current + 1) % counts.length;
      setBeat(current);
      onTickRef.current?.();
      pulse(current);
    }, intervalMs);

    return () => clearInterval(id);
  }, [bpm, counts.length, running, scale]);

  useEffect(() => {
    if (!running) setBeat(0);
  }, [running]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.pulse,
          {
            borderColor: accent,
            transform: [{ scale }],
            shadowColor: accent,
          },
        ]}
      >
        <Text style={[styles.count, { color: accent }]}>
          {running ? counts[beat] : '♪'}
        </Text>
        <Text style={styles.bpm}>{bpm} BPM</Text>
      </Animated.View>

      <View style={styles.beats}>
        {counts.map((c, i) => (
          <View
            key={`${c}-${i}`}
            style={[
              styles.beatDot,
              {
                backgroundColor:
                  running && i === beat ? accent : colors.track,
              },
            ]}
          />
        ))}
      </View>

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: accent, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>{running ? 'Пауза' : 'Счёт'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
  },
  pulse: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  count: {
    fontFamily: fonts.brand,
    fontSize: 88,
    lineHeight: 92,
  },
  bpm: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },
  beats: {
    flexDirection: 'row',
    gap: 8,
  },
  beatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  button: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 18,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 18,
  },
});
