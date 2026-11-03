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
  View,
} from 'react-native';

import { Text } from './Text';
import { useSettings } from '../context/SettingsContext';
import { colors, fonts, radius, spacing, type } from '../theme';

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
  const { soundEnabled, hapticsEnabled } = useSettings();
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
    // Soft studio clave: gentle ticks, clearer downbeat
    tickPlayer.volume = 0.7;
    accentPlayer.volume = 0.95;
  }, [tickPlayer, accentPlayer]);

  useEffect(() => {
    if (!running) return;

    const intervalMs = Math.max(200, Math.round(60000 / bpm));
    let current = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    setBeat(0);

    const pulse = (index: number) => {
      const player =
        index === 0 ? accentPlayerRef.current : tickPlayerRef.current;
      if (soundEnabled) {
        try {
          player.seekTo(0);
          player.play();
        } catch {
          // ignore playback races
        }
      }
      if (hapticsEnabled) {
        Haptics.impactAsync(
          index === 0
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => undefined);
      }
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

    /**
     * Планируем каждый удар от абсолютного времени, а не «через setInterval»:
     * иначе дрейф копится и через минуту счёт расходится с музыкой.
     */
    let nextAt = Date.now() + intervalMs;
    const schedule = () => {
      const delay = Math.max(0, nextAt - Date.now());
      timer = setTimeout(() => {
        current = (current + 1) % counts.length;
        setBeat(current);
        onTickRef.current?.();
        pulse(current);
        nextAt += intervalMs;
        // Приложение могли свернуть - тогда не догоняем «пачкой», а начинаем заново.
        if (Date.now() - nextAt > intervalMs) nextAt = Date.now() + intervalMs;
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [bpm, counts.length, running, scale, soundEnabled, hapticsEnabled]);

  useEffect(() => {
    if (!running) setBeat(0);
  }, [running]);

  /**
   * Счёт может быть словом («Slow», «Quick»), а не только цифрой.
   * Длинную подпись уменьшаем, чтобы она не выходила за круг.
   */
  const countLabel = running ? counts[beat] : '♪';
  const countSize =
    countLabel.length <= 2 ? 84 : countLabel.length <= 4 ? 64 : 50;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={running ? 'Пауза, остановить счёт' : 'Начать счёт под метроном'}
        accessibilityState={{ busy: running }}
        style={({ pressed }) => pressed && styles.pressed}
      >
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
          <Text
            style={[
              styles.count,
              { color: accent, fontSize: countSize, lineHeight: countSize + 6 },
            ]}
          >
            {countLabel}
          </Text>
          <Text style={styles.bpm}>{bpm} BPM</Text>
        </Animated.View>
      </Pressable>

      <View
        style={styles.beats}
        accessibilityLabel={`Доля ${beat + 1} из ${counts.length}`}
      >
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
        accessibilityRole="button"
        accessibilityLabel={running ? 'Пауза' : 'Запустить счёт'}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: accent, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>{running ? 'Пауза' : 'Счёт'}</Text>
      </Pressable>
      <Text style={styles.hint}>
        {running ? 'Счёт идёт — шагай в такт' : 'Нажми на круг или на кнопку, чтобы начать'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  pulse: {
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  count: {
    fontFamily: fonts.brand,
    fontSize: 84,
    lineHeight: 90,
  },
  bpm: {
    ...type.caption,
    marginTop: 2,
  },
  beats: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  beatDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  button: {
    paddingHorizontal: 36,
    paddingVertical: 13,
    borderRadius: radius.card,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    ...type.button,
    color: colors.bg,
  },
  hint: {
    ...type.caption,
    textAlign: 'center',
    maxWidth: 280,
  },
  pressed: {
    opacity: 0.9,
  },
});
