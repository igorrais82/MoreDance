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

import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { StageBackground } from '../src/components/StageBackground';
import { Text as AppText } from '../src/components/Text';
import { TabGlyph } from '../src/components/icons';
import {
  FONT_OPTIONS,
  FONT_SCALES,
  FontKey,
  FontSizeKey,
  PALETTE_PRESETS,
  TAB_META,
  TabKey,
  isTabLocked,
  useSettings,
} from '../src/context/SettingsContext';
import { colors, fonts, radius, spacing, type } from '../src/theme';
import { goBack } from '../src/lib/nav';

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

  const editingAccent = palettes[editing]?.from ?? colors.cyan;

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
        <ScreenHeader
          backLabel="Назад"
          onBack={() => goBack(router)}
          title="Настройки"
          subtitle="Цвета, шрифт и порядок вкладок. Всё сохраняется на этом устройстве."
        />

        {/* Цвета вкладок */}
        <AppText style={[type.section, styles.section]}>Цвета вкладок</AppText>
        <View style={styles.wrapRow}>
          {tabOrder.map((key) => {
            const active = key === editing;
            const palette = palettes[key];
            return (
              <Chip
                key={key}
                label={TAB_META[key].title}
                active={active}
                onPress={() => {
                  setEditing(key);
                  setActiveTab(key);
                }}
                accent={palette.from}
                leading={
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: palette.from, borderColor: palette.to },
                    ]}
                  />
                }
              />
            );
          })}
        </View>

        <View style={styles.swatches}>
          {PALETTE_PRESETS.map((preset) => {
            const selected =
              palettes[editing].from === preset.gradient.from &&
              palettes[editing].to === preset.gradient.to;
            return (
              <Pressable
                key={preset.name}
                onPress={() => setTabPalette(editing, preset.gradient)}
                accessibilityRole="button"
                accessibilityLabel={`Палитра ${preset.name}`}
                accessibilityState={{ selected }}
                style={styles.swatch}
              >
                <View
                  style={[
                    styles.swatchPreview,
                    selected && { borderColor: colors.ink },
                  ]}
                >
                  <View
                    style={[
                      styles.swatchHalf,
                      { backgroundColor: preset.gradient.from },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchHalf,
                      { backgroundColor: preset.gradient.to },
                    ]}
                  />
                </View>
                <AppText
                  style={[type.caption, selected && styles.swatchNameActive]}
                  numberOfLines={1}
                >
                  {preset.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Шрифт */}
        <AppText style={[type.section, styles.section]}>Шрифт</AppText>
        <AppText style={[type.small, styles.hint]}>
          Каждый вариант показан своим шрифтом — выбери тот, что легче читается.
        </AppText>
        {FONT_OPTIONS.map((option) => (
          <FontRow
            key={option.key}
            option={option}
            active={fontKey === option.key}
            onPress={() => setFontKey(option.key as FontKey)}
          />
        ))}

        <View style={styles.sizeRow}>
          {FONT_SCALES.map((option) => (
            <Chip
              key={option.key}
              label={option.name}
              active={fontSizeKey === option.key}
              onPress={() => setFontSizeKey(option.key as FontSizeKey)}
              accent={editingAccent}
            />
          ))}
        </View>

        <View style={styles.preview}>
          <AppText style={styles.previewDisplay}>Медленный вальс</AppText>
          <AppText style={styles.previewTitle}>Счёт: раз, два, три</AppText>
          <AppText style={styles.previewBody}>
            Так выглядит текст на выбранном шрифте и размере.
          </AppText>
        </View>

        {/* Порядок вкладок */}
        <AppText style={[type.section, styles.section]}>Нижняя панель</AppText>
        <AppText style={[type.small, styles.hint]}>
          Держи значок ≡ и тяни строку вверх или вниз. Переключатель убирает
          вкладку с панели. Вкладку «Сцена» убрать нельзя — это главный экран
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
        <AppText style={[type.section, styles.section]}>Звук и анимации</AppText>
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

/** Строка выбора шрифта: название набрано самим вариантом. */
function FontRow({
  option,
  active,
  onPress,
}: {
  option: { key: string; name: string; hint: string };
  active: boolean;
  onPress: () => void;
}) {
  const key = option.key as FontKey;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.fontRow,
        active && styles.fontRowActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.fontSample}>
        <AppText fontOverride={key} style={styles.fontSampleGlyph}>
          Аа
        </AppText>
      </View>
      <View style={styles.fontText}>
        <AppText fontOverride={key} style={styles.fontName}>
          {option.name}
        </AppText>
        <AppText style={type.caption}>{option.hint}</AppText>
      </View>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
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
      <View style={styles.orderIcon}>
        <TabGlyph icon={TAB_META[tab].icon} size={20} color={colors.muted} />
      </View>
      <AppText
        style={[
          type.strong,
          styles.orderTitle,
          hidden && styles.orderTitleHidden,
        ]}
      >
        {TAB_META[tab].title}
      </AppText>
      {locked ? (
        <View style={styles.lockBadge}>
          <AppText style={styles.lockBadgeText}>на панели</AppText>
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
    <View style={styles.orderRow}>
      <AppText style={[type.strong, styles.orderTitle]}>{title}</AppText>
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
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    marginBottom: spacing.sm,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  chipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  swatch: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 68,
  },
  swatchPreview: {
    width: 68,
    height: 42,
    borderRadius: radius.input,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchHalf: {
    flex: 1,
  },
  swatchNameActive: {
    color: colors.ink,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    marginBottom: spacing.xs + 2,
  },
  fontRowActive: {
    borderColor: colors.ink,
  },
  pressed: {
    opacity: 0.88,
  },
  fontSample: {
    width: 46,
    height: 46,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panelSoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  fontSampleGlyph: {
    fontFamily: fonts.brand,
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
  },
  fontText: {
    flex: 1,
    gap: 1,
  },
  fontName: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.ink,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  preview: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  previewDisplay: {
    fontFamily: fonts.brand,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.6,
    color: colors.ink,
  },
  previewTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 17,
    lineHeight: 23,
    color: colors.ink,
  },
  previewBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: ROW_HEIGHT - 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    marginBottom: 8,
  },
  orderRowActive: {
    borderColor: colors.ink,
    zIndex: 10,
    elevation: 6,
  },
  dragHandle: {
    paddingVertical: spacing.sm,
    paddingRight: 2,
  },
  dragGlyph: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.muted,
  },
  orderIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: {
    flex: 1,
  },
  orderTitleHidden: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  lockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  lockBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  reset: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.coral,
    alignItems: 'center',
  },
  resetText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.coral,
  },
});
