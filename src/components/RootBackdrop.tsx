import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import {
  Gradient,
  backgroundStops,
  spotColors,
  useSettings,
} from '../context/SettingsContext';
import { colors } from '../theme';

/**
 * Единый фон под всем приложением.
 *
 * Старый градиент всегда лежит непрозрачным снизу (`base`), а новая палитра
 * мягко проявляется поверх него (`incoming`). Так в переходе нет ни тёмного,
 * ни белого кадра: даже если анимация ещё не стартовала, экран уже закрашен.
 */
export function RootBackdrop() {
  const { palettes, activeTab, animatedColors } = useSettings();
  const target = palettes[activeTab] ?? palettes.index;

  const [base, setBase] = useState<Gradient>(target);
  const [incoming, setIncoming] = useState<Gradient | null>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const run = useRef(0);

  useEffect(() => {
    if (base.from === target.from && base.to === target.to) return;

    run.current += 1;
    const id = run.current;
    // Слой `base` непрозрачен, поэтому сброс прозрачности ничего не обнажает.
    fade.setValue(0);
    setIncoming(target);

    if (!animatedColors) {
      setBase(target);
      setIncoming(null);
      return;
    }

    Animated.timing(fade, {
      toValue: 1,
      duration: 720,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && run.current === id) {
        setBase(target);
        setIncoming(null);
      }
    });
    // base намеренно не в зависимостях: важен только приход новой палитры.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.from, target.to, animatedColors]);

  return (
    <View style={[styles.fill, styles.base]} pointerEvents="none">
      <StageLayer gradient={base} />
      {incoming ? (
        <Animated.View style={[styles.fill, { opacity: fade }]}>
          <StageLayer gradient={incoming} />
        </Animated.View>
      ) : null}
      <View style={styles.floorLines}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} style={[styles.floorLine, { top: 80 + index * 70 }]} />
        ))}
      </View>
    </View>
  );
}

function StageLayer({ gradient }: { gradient: Gradient }) {
  const stops = backgroundStops(gradient);
  const spots = spotColors(gradient);

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={stops}
        locations={[0, 0.48, 1]}
        start={{ x: 0.05, y: 0.15 }}
        end={{ x: 0.95, y: 0.95 }}
        style={styles.fill}
      />
      <LinearGradient
        colors={[spots.top, 'transparent']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.55 }}
        style={styles.spotlightTop}
      />
      <LinearGradient
        colors={['transparent', spots.bottom]}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  base: {
    // Тёмная подложка на случай, если градиент ещё не отрисован.
    backgroundColor: colors.bg,
  },
  spotlightTop: {
    position: 'absolute',
    top: -60,
    left: -40,
    right: -40,
    height: 320,
  },
  floorLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.07,
  },
  floorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.cyan,
  },
});
