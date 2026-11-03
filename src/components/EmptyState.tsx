import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, radius, spacing, type } from '../theme';

/**
 * Пустое состояние раздела.
 *
 * Раньше здесь рисовалась круглая «кнопка» с ▶ — она выглядела нажимаемой,
 * но ничего не делала. Теперь это честная плашка «Скоро» без ложных кнопок.
 */
export function EmptyState({
  title,
  copy,
  actionLabel,
  onAction,
}: {
  title: string;
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Скоро</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: colors.panelSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
  },
  badgeText: {
    ...type.label,
    color: colors.muted,
  },
  title: {
    ...type.cardTitle,
    textAlign: 'center',
  },
  copy: {
    ...type.small,
    textAlign: 'center',
    maxWidth: 330,
  },
  action: {
    marginTop: spacing.xs,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
  },
  actionText: {
    ...type.strong,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
});
