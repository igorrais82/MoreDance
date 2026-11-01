import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { VideoTile } from './VideoTile';
import { performances } from '../data/performances';
import { colors, fonts, spacing } from '../theme';

/** Список роликов «Выступления и разное» для под-вкладки на «Сцене». */
export function PerformancesList() {
  const hasVideos = performances.length > 0;

  if (!hasVideos) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyBadge}>
          <Text style={styles.emptyGlyph}>▶</Text>
        </View>
        <Text style={styles.emptyTitle}>Видео скоро появятся</Text>
        <Text style={styles.emptyCopy}>
          Здесь будут наши выступления с концертов и мероприятий, а ещё просто
          ролики с танцорами. Как только записи будут готовы, они появятся тут.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {performances.map((item, index) => (
        <VideoTile
          key={item.id}
          href={`/performance/${item.id}`}
          title={item.title}
          label={item.place ? item.place : 'Выступление'}
          subtitle={item.description}
          poster={item.poster}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: spacing.md,
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
