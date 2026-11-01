import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VideoTile } from '../../src/components/VideoTile';
import { BrandLogo } from '../../src/components/BrandLogo';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { adultVideos } from '../../src/data/adultGroup';
import { colors, fonts, spacing } from '../../src/theme';

export default function AdultGroupScreen() {
  const insets = useSafeAreaInsets();
  const hasVideos = adultVideos.length > 0;
  const stylesList = Array.from(new Set(adultVideos.map((video) => video.style)));
  const stylesText =
    stylesList.length > 0 ? stylesList.join(', ') : 'список пополнится вместе с первыми видео';

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <BrandLogo size={72} style={styles.logo} />
        <Text style={styles.title}>Взрослая группа</Text>
        <Text style={styles.copy}>
          {hasVideos
            ? `Танцы, которые танцует взрослая группа: ${stylesText}. Это не бальная программа, а то, что взрослые разучивают на занятиях и танцуют для себя.`
            : 'Здесь будут танцы, которые исполняет взрослая группа. Это не бальная программа, а то, что взрослые разучивают на занятиях и танцуют для себя.'}
        </Text>

        {hasVideos ? (
          <>
            <Text style={styles.group}>Видео группы</Text>
            {adultVideos.map((video, index) => (
              <VideoTile
                key={video.id}
                href={`/adult/${video.id}`}
                title={video.title}
                label={video.style}
                subtitle={video.dancers}
                poster={video.poster}
                index={index}
              />
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyBadge}>
              <Text style={styles.emptyGlyph}>▶</Text>
            </View>
            <Text style={styles.emptyTitle}>Видео скоро появятся</Text>
            <Text style={styles.emptyCopy}>
              Мы готовим записи взрослой группы. Как только ролики будут готовы,
              они появятся здесь, с названием танца и составом.
            </Text>
          </View>
        )}
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  logo: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,245,255,0.4)',
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 28,
    color: colors.ink,
    marginTop: 4,
    marginBottom: 8,
  },
  copy: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  group: {
    fontFamily: fonts.brand,
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  empty: {
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: 10,
  },
  emptyBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.08)',
    marginBottom: 4,
  },
  emptyGlyph: {
    fontSize: 22,
    color: colors.cyan,
    marginLeft: 3,
  },
  emptyTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyCopy: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
});
