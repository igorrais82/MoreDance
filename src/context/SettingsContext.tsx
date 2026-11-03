import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mix, withAlpha } from '../lib/color';

export type TabKey = 'index' | 'adult' | 'dances' | 'progress' | 'dancer';

/** Порядок по умолчанию: «Сцена» в центре, слева от неё «Танцы», дальше «Взрослые». */
export const TAB_KEYS: TabKey[] = ['adult', 'dances', 'index', 'progress', 'dancer'];

/**
 * Вкладки, которые нельзя убрать с панели: «Сцена» — главный экран приложения.
 * Порядок у них менять можно, видимость — нет.
 */
export const LOCKED_TABS: TabKey[] = ['index'];

export function isTabLocked(tab: TabKey): boolean {
  return LOCKED_TABS.includes(tab);
}

export const TAB_META: Record<
  TabKey,
  { title: string; icon: 'star' | 'note' | 'group' | 'chart' | 'person'; route: string }
> = {
  index: { title: 'Сцена', icon: 'star', route: '/' },
  adult: { title: 'Взрослые', icon: 'group', route: '/adult' },
  dances: { title: 'Танцы', icon: 'note', route: '/dances' },
  progress: { title: 'Прогресс', icon: 'chart', route: '/progress' },
  dancer: { title: 'Танцор', icon: 'person', route: '/dancer' },
};

export type Gradient = { from: string; to: string };

export const PALETTE_PRESETS: { name: string; gradient: Gradient }[] = [
  { name: 'Закат', gradient: { from: '#FF8A3D', to: '#FF4DC4' } },
  { name: 'Неон', gradient: { from: '#00F5FF', to: '#D400FF' } },
  { name: 'Мята', gradient: { from: '#2EE6C5', to: '#00B3FF' } },
  { name: 'Золото', gradient: { from: '#FFD84A', to: '#FF7A45' } },
  { name: 'Индиго', gradient: { from: '#6C8CFF', to: '#9B4DFF' } },
  { name: 'Роза', gradient: { from: '#FF4DC4', to: '#7A2BFF' } },
  { name: 'Лайм', gradient: { from: '#A8FF60', to: '#2EE6C5' } },
  { name: 'Лёд', gradient: { from: '#7FE7FF', to: '#7A8CFF' } },
  { name: 'Побережье', gradient: { from: '#0ABAB5', to: '#CD853F' } },
  // Вторая десятка держит по одному-двум оттенкам на каждый участок круга:
  // красный, зелёный, синий, коричневый, фиолетовый, нейтральный.
  // Начало градиента заметно светлое: им красится значок активной вкладки.
  { name: 'Вишня', gradient: { from: '#FF2D55', to: '#7E0033' } },
  { name: 'Изумруд', gradient: { from: '#00E676', to: '#00705F' } },
  { name: 'Кобальт', gradient: { from: '#2F6BFF', to: '#00C2FF' } },
  { name: 'Терракота', gradient: { from: '#F4511E', to: '#8D3B0F' } },
  { name: 'Слива', gradient: { from: '#C94DE0', to: '#3B0A6B' } },
  { name: 'Графит', gradient: { from: '#8A93A3', to: '#D1D5DB' } },
  { name: 'Лаванда', gradient: { from: '#B8A1FF', to: '#FFB3E6' } },
  { name: 'Затмение', gradient: { from: '#FF6A00', to: '#2E0A5A' } },
  { name: 'Сияние', gradient: { from: '#00FFB3', to: '#7A00FF' } },
  { name: 'Кислота', gradient: { from: '#E8FF00', to: '#FF0066' } },
];

export const DEFAULT_TAB_PALETTES: Record<TabKey, Gradient> = {
  index: { from: '#00F5FF', to: '#D400FF' },
  adult: { from: '#FFC02E', to: '#FF4DC4' },
  dances: { from: '#FF4DC4', to: '#7A2BFF' },
  progress: { from: '#2EE6C5', to: '#00B3FF' },
  dancer: { from: '#6C8CFF', to: '#9B4DFF' },
};

export type FontKey =
  | 'classic'
  | 'round'
  | 'strict'
  | 'serif'
  | 'mono'
  | 'hand';

export const FONT_OPTIONS: { key: FontKey; name: string; hint: string }[] = [
  { key: 'classic', name: 'Классика', hint: 'Bebas Neue в цифрах и латинских названиях' },
  { key: 'round', name: 'Круглый', hint: 'только Nunito, без Bebas' },
  { key: 'strict', name: 'Строгий', hint: 'системный шрифт телефона' },
  { key: 'serif', name: 'Сериф', hint: 'Playfair Display в заголовках, Lora в тексте' },
  { key: 'mono', name: 'Моно', hint: 'JetBrains Mono — как табло студии' },
  { key: 'hand', name: 'Почерк', hint: 'Caveat в заголовках, Comfortaa в тексте' },
];

export const FONT_SCALES = [
  { key: 'small', name: 'Мелкий', scale: 0.9 },
  { key: 'normal', name: 'Обычный', scale: 1 },
  { key: 'large', name: 'Крупный', scale: 1.15 },
] as const;

export type FontSizeKey = (typeof FONT_SCALES)[number]['key'];

type Settings = {
  palettes: Record<TabKey, Gradient>;
  fontKey: FontKey;
  fontSizeKey: FontSizeKey;
  tabOrder: TabKey[];
  hiddenTabs: TabKey[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  animatedColors: boolean;
};

const STORAGE_KEY = 'moredance.settings.v3';

const defaultSettings: Settings = {
  palettes: DEFAULT_TAB_PALETTES,
  fontKey: 'classic',
  fontSizeKey: 'normal',
  tabOrder: TAB_KEYS,
  hiddenTabs: [],
  soundEnabled: true,
  hapticsEnabled: true,
  animatedColors: true,
};

type SettingsValue = Settings & {
  ready: boolean;
  activeTab: TabKey;
  fontScale: number;
  setActiveTab: (tab: TabKey) => void;
  setTabPalette: (tab: TabKey, gradient: Gradient) => void;
  setFontKey: (key: FontKey) => void;
  setFontSizeKey: (key: FontSizeKey) => void;
  setTabOrder: (order: TabKey[]) => void;
  toggleTabVisible: (tab: TabKey) => void;
  setSoundEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setAnimatedColors: (value: boolean) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

/**
 * Градиент фона под конкретную палитру вкладки.
 *
 * Красители намеренно берутся с низким весом: фон остаётся тёмным при любой
 * палитре, поэтому светлый текст читается одинаково на всех вкладках, а цвет
 * вкладки читается как подсветка сцены, а не как заливка во весь экран.
 */
export function backgroundStops(gradient: Gradient): [string, string, string] {
  const top = mix('#0B1A22', gradient.from, 0.2);
  const middle = mix('#100624', mix(gradient.from, gradient.to, 0.5), 0.1);
  const bottom = mix('#160726', gradient.to, 0.2);
  return [top, middle, bottom];
}

export function spotColors(gradient: Gradient) {
  return {
    top: withAlpha(gradient.from, 0.1),
    bottom: withAlpha(gradient.to, 0.12),
  };
}

export function Provider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('index');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<Settings>;
          setSettings({
            ...defaultSettings,
            ...parsed,
            palettes: { ...DEFAULT_TAB_PALETTES, ...(parsed.palettes ?? {}) },
            tabOrder: normalizeOrder(parsed.tabOrder),
            // «Сцена» не может быть скрыта — чиним и старые сохранения.
            hiddenTabs: normalizeHidden(parsed.hiddenTabs),
          });
        }
      } catch {
        // defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const value = useMemo<SettingsValue>(() => {
    const fontScale =
      FONT_SCALES.find((item) => item.key === settings.fontSizeKey)?.scale ?? 1;

    return {
      ...settings,
      ready,
      activeTab,
      fontScale,
      setActiveTab,
      setTabPalette: (tab, gradient) =>
        persist({ ...settings, palettes: { ...settings.palettes, [tab]: gradient } }),
      setFontKey: (fontKey) => persist({ ...settings, fontKey }),
      setFontSizeKey: (fontSizeKey) => persist({ ...settings, fontSizeKey }),
      setTabOrder: (tabOrder) => persist({ ...settings, tabOrder: normalizeOrder(tabOrder) }),
      toggleTabVisible: (tab) => {
        if (isTabLocked(tab)) return;
        persist({
          ...settings,
          hiddenTabs: settings.hiddenTabs.includes(tab)
            ? settings.hiddenTabs.filter((item) => item !== tab)
            : [...settings.hiddenTabs, tab],
        });
      },
      setSoundEnabled: (soundEnabled) => persist({ ...settings, soundEnabled }),
      setHapticsEnabled: (hapticsEnabled) => persist({ ...settings, hapticsEnabled }),
      setAnimatedColors: (animatedColors) => persist({ ...settings, animatedColors }),
      resetSettings: () => persist(defaultSettings),
    };
  }, [settings, ready, activeTab, persist]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const SettingsProvider = Provider;

function normalizeOrder(order: TabKey[] | undefined): TabKey[] {
  if (!Array.isArray(order)) return TAB_KEYS;
  const valid = order.filter((key) => TAB_KEYS.includes(key));
  const missing = TAB_KEYS.filter((key) => !valid.includes(key));
  return [...valid, ...missing];
}

/** Скрытые вкладки без тех, что убирать нельзя. */
function normalizeHidden(hidden: TabKey[] | undefined): TabKey[] {
  if (!Array.isArray(hidden)) return [];
  return hidden.filter((key) => TAB_KEYS.includes(key) && !isTabLocked(key));
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

/** Палитра активной вкладки (для фона и панели). */
export function useActiveGradient(): Gradient {
  const { palettes, activeTab } = useSettings();
  return palettes[activeTab] ?? DEFAULT_TAB_PALETTES.index;
}

/** Определяет вкладку по адресу; null для экранов вне панели (урок, настройки). */
export function tabFromPath(path: string | undefined): TabKey | null {
  const segment = (path ?? '/').split('?')[0].split('/').filter(Boolean)[0];
  if (!segment) return 'index';
  return TAB_KEYS.includes(segment as TabKey) ? (segment as TabKey) : null;
}
