import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PoseArms, PoseStance } from '../data/media';
import { colors } from '../theme';

type Props = {
  stance: PoseStance;
  arms: PoseArms;
  accent?: string;
  active?: boolean;
};

/** Stick-figure guide for the expected ballroom pose. */
export function PoseSilhouette({
  stance,
  arms,
  accent = colors.gold,
  active = true,
}: Props) {
  const opacity = active ? 1 : 0.45;
  const footSpread =
    stance === 'open' || stance === 'side' ? 36 : stance === 'closed' ? 10 : 22;
  const bodyShift =
    stance === 'forward' ? -8 : stance === 'back' ? 8 : stance === 'side' ? 14 : 0;

  const armStyle = (() => {
    switch (arms) {
      case 'frame':
        return { leftRotate: -25, rightRotate: 25, leftY: 8, rightY: 8 };
      case 'up':
        return { leftRotate: -110, rightRotate: 110, leftY: -10, rightY: -10 };
      case 'side':
        return { leftRotate: -70, rightRotate: 70, leftY: 4, rightY: 4 };
      case 'bounce':
        return { leftRotate: -40, rightRotate: 40, leftY: 16, rightY: 16 };
      default:
        return { leftRotate: -15, rightRotate: 15, leftY: 18, rightY: 18 };
    }
  })();

  return (
    <View style={[styles.root, { opacity }]} pointerEvents="none">
      <View style={[styles.figure, { transform: [{ translateX: bodyShift }] }]}>
        <View style={[styles.head, { borderColor: accent }]} />
        <View style={[styles.torso, { backgroundColor: accent }]} />
        <View
          style={[
            styles.arm,
            styles.armLeft,
            {
              backgroundColor: accent,
              transform: [
                { rotate: `${armStyle.leftRotate}deg` },
                { translateY: armStyle.leftY },
              ],
            },
          ]}
        />
        <View
          style={[
            styles.arm,
            styles.armRight,
            {
              backgroundColor: accent,
              transform: [
                { rotate: `${armStyle.rightRotate}deg` },
                { translateY: armStyle.rightY },
              ],
            },
          ]}
        />
        <View style={[styles.legs, { width: 40 + footSpread }]}>
          <View style={[styles.leg, { backgroundColor: accent }]} />
          <View style={[styles.leg, { backgroundColor: accent }]} />
        </View>
      </View>
      <View style={[styles.floorOval, { borderColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 220,
  },
  figure: {
    alignItems: 'center',
    width: 120,
    height: 180,
  },
  head: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    marginBottom: 4,
  },
  torso: {
    width: 18,
    height: 56,
    borderRadius: 8,
  },
  arm: {
    position: 'absolute',
    top: 42,
    width: 10,
    height: 54,
    borderRadius: 5,
  },
  armLeft: {
    left: 18,
    transformOrigin: 'top',
  },
  armRight: {
    right: 18,
    transformOrigin: 'top',
  },
  legs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  leg: {
    width: 10,
    height: 64,
    borderRadius: 5,
  },
  floorOval: {
    width: 120,
    height: 28,
    borderRadius: 60,
    borderWidth: 2,
    marginTop: 4,
    opacity: 0.5,
  },
});
