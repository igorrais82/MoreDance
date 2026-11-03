import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from './EmptyState';
import { VideoTile } from './VideoTile';
import { performances } from '../data/performances';
import { spacing } from '../theme';

/** Список роликов «Афиша» для под-вкладки на «Сцене». */
export function PerformancesList() {
  const hasVideos = performances.length > 0;

  if (!hasVideos) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title="Афиша пока пустая"
          copy="Здесь будут выступления с концертов и мероприятий, а ещё просто ролики с танцорами. Как только записи появятся — они будут тут."
        />
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
  emptyWrap: {
    marginTop: spacing.md,
  },
});
