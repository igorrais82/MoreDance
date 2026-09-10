import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DanceTile } from '../../src/components/DanceTile';
import { StageBackground } from '../../src/components/StageBackground';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { colors, fonts, spacing } from '../../src/theme';

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
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>MoreDance</Text>
        <Text style={styles.title}>Каталог танцев</Text>
        <Text style={styles.copy}>
          Выбери танец, открой урок и потренируй фигуры под счёт.
        </Text>

        <Text style={styles.group}>Стандарт</Text>
        {standard.map((dance) => (
          <DanceTile
            key={dance.id}
            dance={dance}
            progress={danceProgress(dance.id)}
          />
        ))}

        <Text style={[styles.group, { marginTop: spacing.md }]}>Латина</Text>
        {latin.map((dance) => (
          <DanceTile
            key={dance.id}
            dance={dance}
            progress={danceProgress(dance.id)}
          />
        ))}
        <View style={{ height: 12 }} />
      </ScrollView>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  brand: {
    fontFamily: fonts.brand,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: 1,
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
});
