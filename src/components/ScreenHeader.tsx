import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BrandLogo } from './BrandLogo';
import { Text } from './Text';
import { colors, spacing, type } from '../theme';

/**
 * Верх экрана: возврат или логотип, заголовок и одна строка пояснения.
 * Все экраны начинаются одинаково, поэтому заголовки не «прыгают» по размеру.
 */
export function ScreenHeader({
  title,
  subtitle,
  backLabel,
  onBack,
  logo = false,
}: {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  logo?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {logo ? <BrandLogo size={72} style={styles.logo} /> : null}
      {backLabel && onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={type.link}>← {backLabel}</Text>
        </Pressable>
      ) : null}
      <Text style={[type.title, styles.title]}>{title}</Text>
      {subtitle ? <Text style={[type.bodyMuted, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  logo: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    maxWidth: 460,
  },
});
