import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../src/components/StageBackground';
import { Text as AppText } from '../src/components/Text';
import {
  FONT_OPTIONS,
  FONT_SCALES,
  FontKey,
  FontSizeKey,
  PALETTE_PRESETS,
  TAB_KEYS,
  TAB_META,
  TabKey,
  isTabLocked,
  useSettings,
} from '../src/context/SettingsContext';
import { colors, fonts, spacing } from '../src/theme';

const ROW_HEIGHT = 62;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    palettes,
    tabOrder,
    hiddenTabs,
    fontKey,
    fontSizeKey,
    soundEnabled,
    hapticsEnabled,
    animatedColors,
    setTabPalette,
    setFontKey,
    setFontSizeKey,
    setTabOrder,
    toggleTabVisible,
    setSoundEnabled,
    setHapticsEnabled,
    setAnimatedColors,
    resetSettings,
    setActiveTab,
  } = useSettings();

  const [editing, setEditing] = useState<TabKey>('dances');
  const [dragging, setDragging] = useState(false);

  const move = (from: number, to: number) => {
    const next = [...tabOrder];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setTabOrder(next);
  };

  return (
    <StageBackground>
      <ScrollView
        scrollEnabled={!dragging}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <AppText style={styles.back}>← Назад</AppText>
          </Pressable>
        </View>

        <AppText style={styles.title}>Настройки</AppText>
        <AppText style={styles.copy}>
          Цвета, шрифт и порядок вкладок. Всё сохраняется на этом устройстве.
        </AppText>

        {/* Цвета вкладок */}
        <AppText style={styles.section}>Цвета вкладок</AppText>
        <View style={styles.chips}>
          {tabOrder.map((key) => {
            const active = key === editing;
            const palette = palettes[key];
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setEditing(key);
                  setActiveTab(key);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: palette.from, borderColor: palette.to },
                  ]}
                />
                <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                  {TAB_META[key].title}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.swatches}>
          {PALETTE_PRESETS.map((preset) => (
            <Pressable
              key={preset.name}
              onPress={() => setTabPalette(editing, preset.gradient)}
              style={styles.swatch}
            >
              <View
                style={[
                  styles.swatchPreview,
                  {
                    borderColor:
                      palettes[editing].from === preset.gradient.from &&
                      palettes[editing].to === preset.gradient.to
                        ? colors.ink
                        : 'transparent',
                  },
                ]}
              >
                <View
                  style={[styles.swatchHalf, { backgroundColor: preset.gradient.from }]}
                />
                <View
                  style={[styles.swatchHalf, { backgroundColor: preset.gradient.to }]}
                />
              </View>
              <AppText style={styles.swatchName}>{preset.name}</AppText>
            </Pressable>
          ))}
        </View>

        {/* Шрифт */}
        <AppText style={styles.section}>Шрифт</AppText>
        <View style={styles.rowWrap}>
          {FONT_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setFontKey(option.key as FontKey)}
              style={[styles.pill, fontKey === option.key && styles.pillActive]}
            >
              <AppText
                style={[styles.pillText, fontKey === option.key && styles.pillTextActive]}
              >
                {option.name}
              </AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.rowWrap}>
          {FONT_SCALES.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setFontSizeKey(option.key as FontSizeKey)}
              style={[styles.pill, fontSizeKey === option.key && styles.pillActive]}
            >
              <AppText
                style={[
                  styles.pillText,
                  fontSizeKey === option.key && styles.pillTextActive,
                ]}
              >
                {option.name}
              </AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.preview}>
          <AppText style={styles.previewTitle}>Медленный вальс</AppText>
          <AppText style={styles.previewBody}>
            Так выглядит текст на выбранном шрифте и размере.
          </AppText>
        </View>

        {/* Порядок вкладок */}
        <AppText style={styles.section}>Нижняя панель</AppText>
        <AppText style={styles.hint}>
          Держите значок ≡ и тяните строку вверх или вниз. Переключатель убирает
          вкладку с панели. Вкладку «Сцена» убрать нельзя - это главный экран
          приложения.
        </AppText>
        {tabOrder.map((key, index) => (
          <OrderRow
            key={key}
            tab={key}
            index={index}
            total={tabOrder.length}
            hidden={hiddenTabs.includes(key) && !isTabLocked(key)}
            locked={isTabLocked(key)}
            onMove={move}
            onToggle={() => toggleTabVisible(key)}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
          />
        ))}

        {/* Звук и анимации */}
        <AppText style={styles.section}>Звук и анимации</AppText>
        <ToggleRow
          title="Звук метронома"
          value={soundEnabled}
          onChange={setSoundEnabled}
        />
        <ToggleRow
          title="Вибрация"
          value={hapticsEnabled}
          onChange={setHapticsEnabled}
        />
        <ToggleRow
          title="Плавная смена цветов"
          value={animatedColors}
          onChange={setAnimatedColors}
        />

        <Pressable onPress={resetSettings} style={styles.reset}>
          <AppText style={styles.resetText}>Сбросить настройки</AppText>
        </Pressable>
      </ScrollView>
    </StageBackground>
  );
}

function OrderRow({
  tab,
  index,
  total,
  hidden,
  locked,
  onMove,
  onToggle,
  onDragStart,
  onDragEnd,
}: {
  tab: TabKey;
  index: number;
  total: number;
  hidden: boolean;
  locked: boolean;
  onMove: (from: number, to: number) => void;
  onToggle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const translate = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          setDragging(true);
          onDragStart();
        },
        onPanResponderMove: (_, gesture) => translate.setValue(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          const shift = Math.round(gesture.dy / ROW_HEIGHT);
          translate.setValue(0);
          setDragging(false);
          onDragEnd();
          if (shift !== 0) {
            const target = Math.max(0, Math.min(total - 1, index + shift));
            if (target !== index) onMove(index, target);
          }
        },
        onPanResponderTerminate: () => {
          translate.setValue(0);
          setDragging(false);
          onDragEnd();
        },
      }),
    [index, total, onMove, translate, onDragStart, onDragEnd],
  );

  return (
    <Animated.View
      style={[
        styles.orderRow,
        dragging && styles.orderRowActive,
        { transform: [{ translateY: translate }] },
      ]}
    >
      <View {...responder.panHandlers} style={styles.dragHandle}>
        <AppText style={styles.dragGlyph}>≡</AppText>
      </View>
      <AppText style={styles.orderIcon}>{TAB_META[tab].icon}</AppText>
      <AppText style={[styles.orderTitle, hidden && styles.orderTitleHidden]}>
        {TAB_META[tab].title}
      </AppText>
      {locked ? (
        <View style={styles.lockBadge}>
          <AppText style={styles.lockBadgeText}>всегда на панели</AppText>
        </View>
      ) : (
        <Switch
          value={!hidden}
          onValueChange={onToggle}
          trackColor={{ false: colors.track, true: colors.mint }}
          thumbColor={colors.ink}
        />
      )}
    </Animated.View>
  );
}

function ToggleRow({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <AppText style={styles.toggleTitle}>{title}</AppText>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.track, true: colors.cyan }}
        thumbColor={colors.ink}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.sky,
    fontSize: 15,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 28,
    color: colors.ink,
  },
  copy: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  section: {
    fontFamily: fonts.brand,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
  },
  chipActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.12)',
  },
  chipDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.ink,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.md,
  },
  swatch: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  swatchPreview: {
    width: 72,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchHalf: {
    flex: 1,
  },
  swatchName: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
  },
  pillActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.14)',
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.muted,
  },
  pillTextActive: {
    color: colors.ink,
  },
  preview: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  previewTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 4,
  },
  previewBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: ROW_HEIGHT - 12,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    marginBottom: 8,
  },
  orderRowActive: {
    borderColor: colors.cyan,
    zIndex: 10,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  dragHandle: {
    paddingVertical: 10,
    paddingRight: 4,
  },
  dragGlyph: {
    fontSize: 20,
    color: colors.muted,
  },
  orderIcon: {
    fontSize: 16,
    color: colors.muted,
  },
  orderTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  orderTitleHidden: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  lockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.35)',
    backgroundColor: 'rgba(0,245,255,0.10)',
  },
  lockBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.sky,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    marginBottom: 8,
  },
  toggleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  reset: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.coral,
    alignItems: 'center',
  },
  resetText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.coral,
  },
});
