import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  Gradient,
  TAB_KEYS,
  TAB_META,
  TabKey,
  isTabLocked,
  tabFromPath,
  useSettings,
} from '../../src/context/SettingsContext';
import { colors, fonts } from '../../src/theme';
import { withAlpha } from '../../src/lib/color';

function routeToTab(path: string | undefined): TabKey | null {
  return tabFromPath(path);
}

function TabIcon({
  tab,
  label,
  focused,
  tint,
  large,
  scale,
}: {
  tab: TabKey;
  label: string;
  focused: boolean;
  tint: string;
  large?: boolean;
  scale: number;
}) {
  const color = focused ? tint : colors.muted;
  // У ноты узкий глиф, поэтому её рисуем чуть крупнее, чтобы она не казалась меньше.
  const glyphBoost = tab === 'dances' ? 1.22 : 1;
  const size = Math.round((large ? 24 : 18) * glyphBoost * Math.min(scale, 1.1));

  // «Танцор» рисуем заливкой, чтобы иконка не отличалась от остальных.
  if (tab === 'dancer') {
    return (
      <View style={styles.iconWrap}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 3.2a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 10.4c4.5 0 8.2 2.3 8.2 5.2v2H3.8v-2c0-2.9 3.7-5.2 8.2-5.2Z"
            fill={color}
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, { fontSize: size, color }]}>{label}</Text>
    </View>
  );
}

/** Градиентная подложка панели: старый цвет плавно сменяется новым. */
function TabBarBackground({
  from,
  to,
  fade,
}: {
  from: Gradient;
  to: Gradient;
  fade: Animated.Value;
}) {
  return (
    <View style={[styles.bgFill, styles.bgBase]}>
      <LinearGradient
        colors={[withAlpha(from.from, 0.35), withAlpha(from.to, 0.35)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bgFill}
      />
      <Animated.View style={[styles.bgFill, { opacity: fade }]}>
        <LinearGradient
          colors={[withAlpha(to.from, 0.35), withAlpha(to.to, 0.35)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bgFill}
        />
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  // iPhone has a home indicator (inset ~34) and older devices have none,
  // so the bar height must follow the safe area instead of a fixed 64.
  const insets = useSafeAreaInsets();
  const barHeight = 68 + insets.bottom;
  const path = usePathname();

  const {
    palettes,
    tabOrder,
    hiddenTabs,
    animatedColors,
    fontScale,
    activeTab,
    setActiveTab,
  } = useSettings();

  const palette = palettes[routeToTab(path) ?? activeTab] ?? palettes.index;
  // «Сцена» всегда остаётся на панели, даже если в настройках что-то устарело.
  const visibleOrder = tabOrder.filter(
    (key) => !hiddenTabs.includes(key) || isTabLocked(key),
  );
  const centerKey = visibleOrder[Math.floor((visibleOrder.length - 1) / 2)];
  const [from, setFrom] = useState<Gradient>(palette);
  const [to, setTo] = useState<Gradient>(palette);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const tab = routeToTab(path);
    if (tab) setActiveTab(tab);
  }, [path, setActiveTab]);

  useEffect(() => {
    if (from.from === palette.from && from.to === palette.to) return;
    setFrom(to);
    setTo(palette);
    fade.setValue(0);
    if (!animatedColors) {
      fade.setValue(1);
      return;
    }
    // useNativeDriver: false заставлял анимировать непрозрачность из JS каждый
    // кадр, и переключение вкладки заметно подвисало.
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette.from, palette.to, animatedColors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: barHeight, paddingBottom: insets.bottom + 6 }],
        tabBarBackground: () => (
          <TabBarBackground from={from} to={to} fade={fade} />
        ),
        tabBarActiveTintColor: palette.from,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.label,
      }}
    >
      {tabOrder.map((key) => {
        const meta = TAB_META[key];
        const hidden = hiddenTabs.includes(key) && !isTabLocked(key);
        const isMain = key === centerKey;

        return (
          <Tabs.Screen
            key={key}
            name={key}
            options={{
              title: meta.title,
              href: hidden ? null : meta.route,
              tabBarLabelStyle: [
                styles.label,
                { fontSize: Math.round((isMain ? 14 : 12) * fontScale) },
                isMain && styles.labelMain,
              ],
              tabBarIcon: ({ focused }) => (
                <TabIcon
                  tab={key}
                  label={meta.icon}
                  focused={focused}
                  tint={palette.from}
                  large={isMain}
                  scale={fontScale}
                />
              ),
            }}
          />
        );
      })}
      {/* Экран «Родитель» теперь под-вкладка внутри «Танцора», с панели убран. */}
      <Tabs.Screen name="parent" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopColor: colors.line,
    borderTopWidth: 1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    paddingTop: 6,
  },
  bgBase: {
    backgroundColor: '#160A32',
  },
  bgFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  labelMain: {
    fontFamily: fonts.bodyExtra,
    letterSpacing: 0.2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    color: colors.muted,
  },
});
