/**
 * Единая тема приложения.
 *
 * Правила, которых держится весь интерфейс:
 * - заголовки и подписи кнопок — Nunito ExtraBold (`fonts.bodyExtra`);
 * - обычный текст и подсказки — Nunito Medium (`fonts.body`), жирный акцент — `bodyBold`;
 * - Bebas Neue (`fonts.brand`) — только цифры, таймеры и латинские названия танцев;
 * - один набор размеров и межстрочных интервалов из `type`;
 * - панели — один радиус и одна рамка (`radius.card`, `colors.line`).
 */

export const colors = {
  bg: '#14082A',
  bgElevated: '#1C1040',
  bgSoft: '#0A2F44',
  ink: '#F7FBFF',
  muted: '#B9A8D6',
  gold: '#FFD84A',
  coral: '#FF4DC4',
  mint: '#2EE6C5',
  sky: '#00F5FF',
  blue: '#3D8BFF',
  magenta: '#D400FF',
  cyan: '#00F5FF',
  /** Нейтральная рамка панелей: читается на любой палитре вкладки. */
  line: 'rgba(247, 251, 255, 0.14)',
  lineStrong: 'rgba(247, 251, 255, 0.24)',
  overlay: 'rgba(20, 8, 42, 0.78)',
  /** Плотная подложка: текст на ней читается при любом фоне. */
  panel: 'rgba(24, 13, 52, 0.94)',
  panelSoft: 'rgba(20, 12, 44, 0.72)',
  track: 'rgba(247, 251, 255, 0.10)',
};

/**
 * Семейства шрифтов. Основной набор — Bebas + Nunito; остальные семейства
 * подключаются только когда пользователь выбрал их в настройках.
 */
export const fonts = {
  brand: 'BebasNeue_400Regular',
  body: 'Nunito_500Medium',
  bodyBold: 'Nunito_700Bold',
  bodyExtra: 'Nunito_800ExtraBold',
  /** «Сериф»: Playfair Display в заголовках, Lora в тексте. */
  serifDisplay: 'PlayfairDisplay_700Bold',
  serif: 'Lora_500Medium',
  serifBold: 'Lora_600SemiBold',
  /** «Моно». */
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_500Medium',
  monoDisplay: 'JetBrainsMono_700Bold',
  monoExtra: 'JetBrainsMono_800ExtraBold',
  /** «Почерк»: Caveat в заголовках, Comfortaa в тексте. */
  hand: 'Caveat_700Bold',
  soft: 'Comfortaa_400Regular',
  softBold: 'Comfortaa_600SemiBold',
  softExtra: 'Comfortaa_700Bold',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  pill: 999,
  input: 14,
  card: 18,
  tile: 22,
};

/**
 * Типографика. Имена ролей, а не размеров: экран выбирает роль, поэтому
 * одинаковые по смыслу элементы выглядят одинаково на всех экранах.
 */
export const type = {
  /** Крупный брендовый заголовок (главная «Сцена»). */
  hero: {
    fontFamily: fonts.brand,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0.6,
    color: colors.ink,
  },
  /** Заголовок вкладки. */
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
  },
  /** Заголовок вложенного экрана. */
  screen: {
    fontFamily: fonts.bodyExtra,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
  },
  /** Заголовок раздела внутри экрана. */
  section: {
    fontFamily: fonts.bodyExtra,
    fontSize: 19,
    lineHeight: 25,
    color: colors.ink,
    letterSpacing: 0.2,
  },
  /** Заголовок карточки. */
  cardTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 17,
    lineHeight: 23,
    color: colors.ink,
  },
  /** Основной текст. */
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  /** Основной текст второго плана. */
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  /** Пояснение под блоком. */
  small: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  /** Самая мелкая подпись. */
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
  },
  /** Надпись над значением. */
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  /** Акцентная строка: пункт списка, результат. */
  strong: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  /** Ссылка-возврат в шапке экрана. */
  link: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.sky,
  },
  /** Надпись на кнопке. */
  button: {
    fontFamily: fonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
  },
  /** Крупное число-показатель. */
  metric: {
    fontFamily: fonts.brand,
    fontSize: 38,
    lineHeight: 44,
    color: colors.ink,
  },
  /** Таймер и счёт метронома. */
  timer: {
    fontFamily: fonts.brand,
    fontSize: 64,
    lineHeight: 70,
    color: colors.ink,
  },
} as const;

export type TypeRole = keyof typeof type;
