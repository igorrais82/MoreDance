import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '../../src/components/BrandLogo';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { colors, fonts, spacing } from '../../src/theme';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m} мин ${s.toString().padStart(2, '0')} сек`;
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const {
    stars,
    level,
    completedLessons,
    practiceSeconds,
    totalLessons,
    danceProgress,
    averagePoseScore,
    cameraPracticeSeconds,
  } = useProgress();

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BrandLogo size={72} style={styles.logo} />
        <Text style={styles.title}>Твой прогресс</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>уровень</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{stars}</Text>
            <Text style={styles.statLabel}>звёзды</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.mint }]}>
              {completedLessons.length}
            </Text>
            <Text style={styles.statLabel}>уроков</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Оценка поз</Text>
          <Text style={styles.panelCopy}>{averagePoseScore}%</Text>
          <Text style={styles.hint}>
            Средний лучший результат с камеры · практика у зеркала:{' '}
            {Math.floor(cameraPracticeSeconds / 60)} мин
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Практика</Text>
          <Text style={styles.panelCopy}>{formatTime(practiceSeconds)}</Text>
          <Text style={styles.hint}>
            За каждые 30 секунд практики под метроном - +1 ★
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.round(
                    (completedLessons.length / Math.max(totalLessons, 1)) * 100,
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.hint}>
            Пройдено {completedLessons.length} из {totalLessons}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>По танцам</Text>
        {dances.map((dance) => {
          const p = danceProgress(dance.id);
          const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
          return (
            <View key={dance.id} style={styles.danceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.danceName}>{dance.name}</Text>
                <Text style={styles.danceMeta}>
                  {p.done}/{p.total} · {pct}%
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: pct === 100 ? colors.mint : `${dance.accent}55` },
                ]}
              >
                <Text style={styles.badgeText}>{pct === 100 ? 'Готово' : `${pct}%`}</Text>
              </View>
            </View>
          );
        })}
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
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 18,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    fontFamily: fonts.brand,
    fontSize: 36,
    color: colors.sky,
  },
  statLabel: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  panelTitle: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 18,
    marginBottom: 8,
  },
  panelCopy: {
    fontFamily: fonts.bodyBold,
    color: colors.gold,
    fontSize: 20,
    marginBottom: 6,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.mint,
  },
  sectionTitle: {
    fontFamily: fonts.brand,
    fontSize: 24,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  danceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  danceName: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 16,
  },
  danceMeta: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 12,
  },
});
