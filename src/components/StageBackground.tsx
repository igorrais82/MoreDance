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
        colors={['#0A3D4A', '#1A0B3A', '#2B0B4A']}
        locations={[0, 0.48, 1]}
        start={{ x: 0.05, y: 0.15 }}
        end={{ x: 0.95, y: 0.95 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,245,255,0.28)', 'transparent']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.55 }}
        style={styles.spotlightCyan}
      />
      <LinearGradient
        colors={['transparent', 'rgba(212,0,255,0.28)']}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,216,74,0.12)', 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0.55 }}
        style={styles.goldLift}
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
  spotlightCyan: {
    position: 'absolute',
    top: -60,
    left: -40,
    right: -40,
    height: 320,
  },
  goldLift: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
  floorLines: {
    ...StyleSheet.absoluteFill,
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
