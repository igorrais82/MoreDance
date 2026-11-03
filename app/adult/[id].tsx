import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonVideo } from '../../src/components/LessonVideo';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { getAdultVideo } from '../../src/data/adultGroup';
import { colors, spacing, type } from '../../src/theme';
import { goBack } from '../../src/lib/nav';

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
          <Pressable onPress={() => goBack(router)} style={styles.backBtn}>
            <Text style={styles.back}>← К взрослой группе</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  return (
    <StageBackground>
      {/* Плеер не скроллится вместе с текстом — так видео не дёргается. */}
      <View style={[styles.stickyPlayer, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => goBack(router)} style={styles.backBtn}>
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
    ...type.link,
  },
  style: {
    ...type.label,
    color: colors.sky,
    marginBottom: spacing.xs,
  },
  title: {
    ...type.screen,
    marginBottom: spacing.xs,
  },
  dancers: {
    ...type.caption,
    marginBottom: spacing.sm,
  },
  description: {
    ...type.body,
  },
});
