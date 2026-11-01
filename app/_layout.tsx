import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ParentProvider } from '../src/context/ParentContext';
import { ProgressProvider } from '../src/context/ProgressContext';
import { DancerProvider } from '../src/context/DancerContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { RootBackdrop } from '../src/components/RootBackdrop';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Прозрачная тема навигации: иначе каждая вкладка красит свой контейнер
 * светлым `colors.background` и перекрывает общий фон `RootBackdrop`.
 */
const transparentTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
    border: colors.line,
    text: colors.ink,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ThemeProvider value={transparentTheme}>
        <SettingsProvider>
          <DancerProvider>
            <ProgressProvider>
              <ParentProvider>
                <RootBackdrop />
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                    // Экраны прозрачные (общий градиент лежит в RootBackdrop),
                    // поэтому fade оставлял прошлый экран просвечивать под новым.
                    // Слайд уводит старый текст за край и заводит новый.
                    animation: 'slide_from_right',
                    animationDuration: 220,
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
                  <Stack.Screen name="dance/[id]" />
                  <Stack.Screen name="adult/[id]" />
                  <Stack.Screen name="performance/[id]" />
                  <Stack.Screen name="lesson/[danceId]/[lessonId]" />
                  <Stack.Screen name="practice/[danceId]/[lessonId]" />
                  <Stack.Screen name="frame/[danceId]/[lessonId]" />
                  <Stack.Screen
                    name="runthrough/[danceId]/[lessonId]"
                    options={{ animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="pose/[danceId]/[lessonId]"
                    options={{ animation: 'slide_from_bottom' }}
                  />
                </Stack>
              </ParentProvider>
            </ProgressProvider>
          </DancerProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
