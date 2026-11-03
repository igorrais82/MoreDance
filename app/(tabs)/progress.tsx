import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../src/components/ScreenHeader';
import { StageBackground } from '../../src/components/StageBackground';
import { Text } from '../../src/components/Text';
import { useParent } from '../../src/context/ParentContext';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { formatHold } from '../../src/lib/frame';
import { plural } from '../../src/lib/plural';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m} мин ${s.toString().padStart(2, '0')} сек`;
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const parent = useParent();
  const {
    stars,
    completedLessons,
    practiceSeconds,
    totalLessons,
    danceProgress,
    todayPracticeSeconds,
    streakDays,
    rank,
    bestHoldSeconds,
    cameraPracticeSeconds,
  } = useProgress();

  const lessonRatio = Math.round(
    (completedLessons.length / Math.max(totalLessons, 1)) * 100,
  );
  const goalSeconds = Math.max(parent.dailyGoalMinutes, 1) * 60;
  const todayRatio = Math.min(1, todayPracticeSeconds / goalSeconds);
  const todayLeftMin = Math.max(
    0,
    Math.ceil((goalSeconds - todayPracticeSeconds) / 60),
  );

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
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          logo
          title="Твой прогресс"
          subtitle="Звание, звёзды и время практики — всё хранится на этом телефоне."
        />

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stars}</Text>
            <Text style={styles.statLabel}>
              {plural(stars, 'звезда', 'звезды', 'звёзд')}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completedLessons.length}</Text>
            <Text style={styles.statLabel}>
              {plural(completedLessons.length, 'урок', 'урока', 'уроков')}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>
              {streakDays > 0
                ? `${plural(streakDays, 'день', 'дня', 'дней')} подряд`
                : 'серия пуста'}
            </Text>
          </View>
        </View>

        <View style={[styles.panel, { borderColor: rank.color }]}>
          <View style={styles.rankRow}>
            <Text style={[styles.rankTitle, { color: rank.color }]}>
              {rank.title}
            </Text>
            <Text style={styles.rankXp}>{rank.xpLabel}</Text>
          </View>
          <Text style={type.small}>{rank.hint}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.round(rank.progress * 100)}%`,
                  backgroundColor: rank.color,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Сегодня</Text>
          <Text style={styles.panelValue}>{formatTime(todayPracticeSeconds)}</Text>
          <Text style={type.small}>
            {todayLeftMin > 0
              ? `До цели ${parent.dailyGoalMinutes} мин в день — ещё ${todayLeftMin} мин.`
              : `Цель ${parent.dailyGoalMinutes} мин в день выполнена. Отлично!`}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.round(todayRatio * 100)}%`,
                  backgroundColor: colors.mint,
                },
              ]}
            />
          </View>
          <Text style={styles.barCaption}>
            Пройдено {completedLessons.length} из {totalLessons} уроков ·{' '}
            {lessonRatio}%
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Практика</Text>
          <Text style={styles.panelValue}>{formatTime(practiceSeconds)}</Text>
          <Text style={type.small}>
            За каждые 30 секунд счёта под метроном — плюс одна звезда. У зеркала:{' '}
            {Math.floor(cameraPracticeSeconds / 60)} мин.
          </Text>
          <Text style={type.small}>
            Лучшее удержание позы в кадре: {bestHoldSeconds > 0 ? formatHold(bestHoldSeconds) : 'пока нет'}.
          </Text>
        </View>

        <Text style={[type.section, styles.section]}>По танцам</Text>
        {dances.map((dance) => {
          const p = danceProgress(dance.id);
          const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
          const complete = pct === 100;
          return (
            <View key={dance.id} style={styles.danceRow}>
              <View style={styles.danceMain}>
                <Text style={type.strong}>{dance.name}</Text>
                <Text style={type.caption}>
                  {p.done} из {p.total} уроков
                </Text>
              </View>
              <View style={[styles.badge, complete && styles.badgeDone]}>
                <Text style={[styles.badgeText, complete && styles.badgeTextDone]}>
                  {complete ? 'Готово' : `${pct}%`}
                </Text>
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
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    ...type.metric,
  },
  statLabel: {
    ...type.label,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  panelLabel: {
    ...type.label,
  },
  panelValue: {
    ...type.section,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rankTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 22,
    lineHeight: 28,
  },
  rankXp: {
    ...type.label,
    letterSpacing: 0.4,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barCaption: {
    ...type.caption,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  danceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  danceMain: {
    flex: 1,
    gap: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.panel,
  },
  badgeDone: {
    borderColor: colors.mint,
  },
  badgeText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  badgeTextDone: {
    color: colors.mint,
  },
});
