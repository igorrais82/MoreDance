import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, fonts, radius, spacing } from '../theme';

/**
 * Небольшая «таблетка»: под-вкладки, палитры, варианты шрифта и размера.
 * Один вид на всё приложение: рамка, заливка, активное состояние.
 */
export function Chip({
  label,
  active,
  onPress,
  accent = colors.cyan,
  leading,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  /** Цвет активного состояния: обычно `palette.from` активной вкладки. */
  accent?: string;
  leading?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active && { borderColor: accent, backgroundColor: colors.panel },
        pressed && styles.pressed,
      ]}
    >
      {leading}
      <Text style={[styles.text, active && { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** Ряд «таблеток» с одним выбором. */
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  accent,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  accent?: string;
}) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Chip
          key={option.key}
          label={option.label}
          active={option.key === value}
          onPress={() => onChange(option.key)}
          accent={accent}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
