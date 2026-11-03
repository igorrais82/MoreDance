import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../src/components/EmptyState';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { VideoTile } from '../../src/components/VideoTile';
import { adultVideos } from '../../src/data/adultGroup';
import { useSettings } from '../../src/context/SettingsContext';
import { spacing, type } from '../../src/theme';

export default function AdultGroupScreen() {
  const insets = useSafeAreaInsets();
  const { toggleTabVisible } = useSettings();
  const hasVideos = adultVideos.length > 0;
  const stylesList = Array.from(new Set(adultVideos.map((video) => video.style)));
  const stylesText =
    stylesList.length > 0
      ? stylesList.join(', ')
      : 'список пополнится вместе с первыми видео';

  const hideTab = () => {
    Alert.alert(
      'Скрыть вкладку «Взрослые»?',
      'Вернуть её можно в настройках: «Вкладки на панели».',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Скрыть',
          style: 'destructive',
          onPress: () => toggleTabVisible('adult'),
        },
      ],
    );
  };

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 108,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          logo
          title="Взрослая группа"
          subtitle={
            hasVideos
              ? `Танцы, которые танцует взрослая группа: ${stylesText}. Это не бальная программа, а то, что взрослые разучивают на занятиях и танцуют для себя.`
              : 'Танцы, которые исполняет взрослая группа: то, что взрослые разучивают на занятиях и танцуют для себя.'
          }
        />

        {hasVideos ? (
          <>
            <Text style={[type.section, styles.group]}>Видео группы</Text>
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
          <EmptyState
            title="Записи взрослой группы в работе"
            copy="Как только ролики будут готовы, здесь появятся названия танцев и состав. Пока раздел пустой — его можно убрать с панели, чтобы не мешал."
            actionLabel="Скрыть вкладку «Взрослые»"
            onAction={hideTab}
          />
        )}
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  group: {
    marginBottom: spacing.sm,
  },
});
