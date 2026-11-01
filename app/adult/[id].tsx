import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonVideo } from '../../src/components/LessonVideo';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { getAdultVideo } from '../../src/data/adultGroup';
import { colors, fonts, spacing } from '../../src/theme';

export default function AdultVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const video = getAdultVideo(id);

  if (!video) {
    return (
      <StageBackground>
        <View style={[styles.fallback, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.title}>Видео не найдено</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.back}>← К взрослой группе</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  return (
    <StageBackground>
      {/* Плеер не скроллится вместе с текстом - так видео не дёргается. */}
      <View style={[styles.stickyPlayer, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← Взрослая группа</Text>
        </Pressable>
        <LessonVideo label={video.title} source={video.video} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.style}>{video.style}</Text>
        <Text style={styles.title}>{video.title}</Text>
        {video.dancers ? <Text style={styles.dancers}>{video.dancers}</Text> : null}
        {video.description ? (
          <Text style={styles.description}>{video.description}</Text>
        ) : null}
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  stickyPlayer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 2,
    elevation: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  fallback: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.sky,
    fontSize: 15,
  },
  style: {
    fontFamily: fonts.brand,
    fontSize: 18,
    letterSpacing: 1,
    color: colors.cyan,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 26,
    color: colors.ink,
    marginBottom: 4,
  },
  dancers: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
  },
});
