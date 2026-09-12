import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

const ART: Record<string, ImageSourcePropType> = {
  waltz: require('../../assets/dance-anims/waltz.png'),
  'cha-cha': require('../../assets/dance-anims/cha-cha.png'),
  jive: require('../../assets/dance-anims/jive.png'),
  quickstep: require('../../assets/dance-anims/quickstep.png'),
  samba: require('../../assets/dance-anims/samba.png'),
};

type Props = {
  danceId: string;
  accent: string;
  playing?: boolean;
};

/** Vector-style dancer art with a motion loop matching each dance. */
export function DanceLessonAnimation({
  danceId,
  accent,
  playing = true,
}: Props) {
  const t = useRef(new Animated.Value(0)).current;
  const source = ART[danceId] ?? ART.waltz;

  useEffect(() => {
    t.stopAnimation();
    t.setValue(0);
    if (!playing) return;

    const duration =
      danceId === 'jive' || danceId === 'quickstep'
        ? 900
        : danceId === 'samba' || danceId === 'cha-cha'
          ? 1100
          : 1800;

    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [danceId, playing, t]);

  const motion = motionFor(danceId, t);

  return (
    <View style={styles.stage}>
      <View style={[styles.glow, { backgroundColor: accent }]} />
      <Animated.View style={[styles.figureWrap, motion]}>
        <Image source={source} style={styles.art} resizeMode="contain" />
      </Animated.View>
      <View style={[styles.floor, { borderColor: accent }]} />
    </View>
  );
}

function motionFor(danceId: string, t: Animated.Value) {
  if (danceId === 'waltz') {
    const rotate = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['-6deg', '6deg', '-6deg'],
    });
    const y = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [4, -10, 4],
    });
    const scale = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.04, 1],
    });
    return { transform: [{ translateY: y }, { rotate }, { scale }] };
  }

  if (danceId === 'cha-cha') {
    const x = t.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, -14, 0, 14, 0],
    });
    const y = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -6, 0],
    });
    return { transform: [{ translateX: x }, { translateY: y }] };
  }

  if (danceId === 'jive') {
    const y = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [6, -16, 6],
    });
    const rotate = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['-4deg', '5deg', '-4deg'],
    });
    const scale = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.98, 1.06, 0.98],
    });
    return { transform: [{ translateY: y }, { rotate }, { scale }] };
  }

  if (danceId === 'quickstep') {
    const x = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [-18, 18, -18],
    });
    const y = t.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [2, -8, 2],
    });
    return { transform: [{ translateX: x }, { translateY: y }] };
  }

  // samba
  const y = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [8, -14, 8],
  });
  const rotate = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-8deg', '8deg', '-8deg'],
  });
  return { transform: [{ translateY: y }, { rotate }] };
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: 188,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 210,
    height: 130,
    borderRadius: 100,
    opacity: 0.12,
    top: 24,
  },
  figureWrap: {
    width: '94%',
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  art: {
    width: '100%',
    height: '100%',
  },
  floor: {
    position: 'absolute',
    bottom: 2,
    width: 140,
    height: 14,
    borderRadius: 40,
    borderWidth: 1.5,
    opacity: 0.25,
  },
});
