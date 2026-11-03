import React from 'react';
import {
  Platform,
  StyleSheet,
  Text as RNText,
  TextProps,
  TextStyle,
} from 'react-native';

import { FontKey, useSettings } from '../context/SettingsContext';
import { fonts } from '../theme';

/**
 * Текст приложения: применяет выбранный в настройках шрифт и размер.
 *
 * Роль шрифта берётся из исходного `fontFamily` стиля, поэтому вёрстка не
 * ломается при смене набора. Для «Строгого» вместо файлов шрифтов берётся
 * системный Roboto: его плотность задаётся через `fontWeight`, иначе все
 * начертания выглядели бы одинаково.
 *
 * У набора есть поправка `em`: разные семейства при одном кегле выглядят
 * крупнее или мельче (Caveat — мельче, JetBrains Mono — шире), поэтому
 * размер умножается ещё и на неё.
 */
type Role = 'brand' | 'body' | 'bold' | 'extra';

type RoleStyle = { style: TextStyle; em?: number };

const SYSTEM_SANS = Platform.select({ ios: 'System', default: 'sans-serif' });
const SYSTEM_CONDENSED = Platform.select({
  ios: 'System',
  default: 'sans-serif-condensed',
});

const STACKS: Record<FontKey, Record<Role, RoleStyle>> = {
  classic: {
    brand: { style: { fontFamily: fonts.brand } },
    body: { style: { fontFamily: fonts.body } },
    bold: { style: { fontFamily: fonts.bodyBold } },
    extra: { style: { fontFamily: fonts.bodyExtra } },
  },
  round: {
    // «Круглый» — только Nunito: Bebas заменяется на жирный Nunito.
    brand: { style: { fontFamily: fonts.bodyExtra } },
    body: { style: { fontFamily: fonts.body } },
    bold: { style: { fontFamily: fonts.bodyBold } },
    extra: { style: { fontFamily: fonts.bodyExtra } },
  },
  strict: {
    brand: { style: { fontFamily: SYSTEM_CONDENSED, fontWeight: '700' } },
    body: { style: { fontFamily: SYSTEM_SANS, fontWeight: '400' } },
    bold: { style: { fontFamily: SYSTEM_SANS, fontWeight: '600' } },
    extra: { style: { fontFamily: SYSTEM_SANS, fontWeight: '800' } },
  },
  serif: {
    // Журнальная пара: контрастный Playfair в крупном, спокойная Lora в тексте.
    // Lora при том же кегле выглядит мельче Nunito — добавляем 2%.
    brand: { style: { fontFamily: fonts.serifDisplay } },
    body: { style: { fontFamily: fonts.serif }, em: 1.04 },
    bold: { style: { fontFamily: fonts.serifBold }, em: 1.02 },
    extra: { style: { fontFamily: fonts.serifDisplay }, em: 1.02 },
  },
  mono: {
    // Табло: один моноширинный шрифт, роль задаётся насыщенностью.
    // Строка моноширинного шире — в тексте кегль чуть уменьшен, чтобы вёрстка не рвалась.
    brand: { style: { fontFamily: fonts.monoDisplay } },
    body: { style: { fontFamily: fonts.mono }, em: 0.94 },
    bold: { style: { fontFamily: fonts.monoBold }, em: 0.94 },
    extra: { style: { fontFamily: fonts.monoExtra }, em: 0.94 },
  },
  hand: {
    // Рукописные заголовки поверх мягкого геометрического текста.
    // Caveat рассчитан на крупный кегль, поэтому заголовки заметно крупнее.
    brand: { style: { fontFamily: fonts.hand }, em: 1.18 },
    body: { style: { fontFamily: fonts.soft } },
    bold: { style: { fontFamily: fonts.softBold } },
    extra: { style: { fontFamily: fonts.hand }, em: 1.16 },
  },
};

function roleOf(family: string | undefined): Role {
  if (family === fonts.brand) return 'brand';
  if (family === fonts.bodyBold) return 'bold';
  if (family === fonts.bodyExtra) return 'extra';
  return 'body';
}

/** Шрифт роли для набора — нужен экрану настроек для примеров. */
export function fontStack(key: FontKey, role: Role): TextStyle {
  return STACKS[key][role].style;
}

type Props = TextProps & {
  /** Показать текст конкретным набором, не меняя настройку (примеры в настройках). */
  fontOverride?: FontKey;
};

export function Text({ style, fontOverride, ...props }: Props) {
  const { fontKey, fontScale } = useSettings();
  const base = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const key = fontOverride ?? fontKey;
  const role = base.fontFamily ? roleOf(base.fontFamily) : null;
  const spec = role ? STACKS[key][role] : null;
  const scale = fontScale * (spec?.em ?? 1);

  const override: TextStyle = {
    // Семейство не задано явно (символы ▶ ★ ≡) — их оставляем системными.
    ...(spec ? spec.style : null),
    ...(typeof base.fontSize === 'number'
      ? { fontSize: Math.round(base.fontSize * scale) }
      : null),
    ...(typeof base.lineHeight === 'number'
      ? { lineHeight: Math.round(base.lineHeight * scale) }
      : null),
  };

  return <RNText {...props} style={[style, override]} />;
}
