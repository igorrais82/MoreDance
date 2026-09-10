import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function StageBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={['#122E4A', '#0A1628', '#07101C']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(240,180,41,0.18)', 'transparent']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.55 }}
        style={styles.spotlight}
      />
      <LinearGradient
        colors={['transparent', 'rgba(77,183,255,0.12)']}
        start={{ x: 1, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.floorLines} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.floorLine, { top: 80 + i * 70 }]} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  spotlight: {
    position: 'absolute',
    top: -40,
    left: -20,
    right: -20,
    height: 280,
  },
  floorLines: {
    ...StyleSheet.absoluteFill,
    opacity: 0.08,
  },
  floorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.ink,
  },
});
