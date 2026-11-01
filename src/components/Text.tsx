import React from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';

import { FontKey, useSettings } from '../context/SettingsContext';
import { fonts } from '../theme';

/**
 * Текст приложения: применяет выбранный в настройках шрифт и размер.
 * Роль шрифта берётся из исходного fontFamily, поэтому вёрстка не ломается.
 */
export function Text({ style, ...props }: TextProps) {
  const { fontKey, fontScale } = useSettings();
  const base = (StyleSheet.flatten(style) ?? {}) as TextStyle;

  const mapped = mapFamily(base.fontFamily, fontKey);
  const override = {
    ...(mapped !== base.fontFamily ? { fontFamily: mapped } : null),
    ...(typeof base.fontSize === 'number'
      ? { fontSize: Math.round(base.fontSize * fontScale) }
      : null),
    ...(typeof base.lineHeight === 'number'
      ? { lineHeight: Math.round(base.lineHeight * fontScale) }
      : null),
  } as TextStyle;

  return <RNText {...props} style={[style, override]} />;
}

function mapFamily(family: string | undefined, key: FontKey): string | undefined {
  if (!family) return family;

  if (key === 'strict') return undefined;
  if (key === 'round' && family === fonts.brand) return fonts.bodyExtra;

  return family;
}
