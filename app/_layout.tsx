import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ParentProvider } from '../src/context/ParentContext';
import { ProgressProvider } from '../src/context/ProgressContext';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProgressProvider>
        <ParentProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="dance/[id]" />
            <Stack.Screen name="lesson/[danceId]/[lessonId]" />
            <Stack.Screen name="practice/[danceId]/[lessonId]" />
            <Stack.Screen
              name="pose/[danceId]/[lessonId]"
              options={{ animation: 'slide_from_bottom' }}
            />
          </Stack>
        </ParentProvider>
      </ProgressProvider>
    </GestureHandlerRootView>
  );
}
