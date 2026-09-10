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

  useEffect(() => {
    if (!running) return;
    const intervalMs = Math.max(200, Math.round(60000 / bpm));
    const id = setInterval(() => {
      setBeat((prev) => {
        const next = (prev + 1) % counts.length;
        return next;
      });
      onTickRef.current?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      scale.setValue(1.18);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }).start();
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
                  running && i === beat ? accent : 'rgba(244,247,251,0.18)',
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
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 35, 58, 0.9)',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  count: {
    fontFamily: fonts.brand,
    fontSize: 72,
    lineHeight: 76,
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
