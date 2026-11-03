import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DanceTile } from '../../src/components/DanceTile';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { spacing, type } from '../../src/theme';

export default function DancesScreen() {
  const insets = useSafeAreaInsets();
  const { danceProgress } = useProgress();

  const standard = dances.filter((d) => d.style === 'standard');
  const latin = dances.filter((d) => d.style === 'latin');

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            // Запас под плавающую панель вкладок.
            paddingBottom: insets.bottom + 108,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          logo
          title="Каталог танцев"
          subtitle="Выбери танец, открой урок и потренируй фигуры под счёт."
        />

        <Text style={[type.section, styles.group]}>Стандарт</Text>
        {standard.map((dance) => (
          <DanceTile
            key={dance.id}
            dance={dance}
            progress={danceProgress(dance.id)}
          />
        ))}

        <Text style={[type.section, styles.group, styles.groupSpaced]}>Латина</Text>
        {latin.map((dance) => (
          <DanceTile
            key={dance.id}
            dance={dance}
            progress={danceProgress(dance.id)}
          />
        ))}
        <View style={styles.tail} />
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
  groupSpaced: {
    marginTop: spacing.md,
  },
  tail: {
    height: spacing.xs,
  },
});
