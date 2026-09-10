import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../../src/components/StageBackground';
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
    dancerName,
    setDancerName,
    stars,
    level,
    completedLessons,
    practiceSeconds,
    totalLessons,
    danceProgress,
    ready,
    averagePoseScore,
    cameraPracticeSeconds,
  } = useProgress();
  const [nameDraft, setNameDraft] = useState(dancerName);

  useEffect(() => {
    if (ready) setNameDraft(dancerName);
  }, [ready, dancerName]);

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
        <Text style={styles.brand}>MoreDance</Text>
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
          <Text style={styles.panelTitle}>Имя танцора</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Как тебя зовут?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={18}
          />
          <Pressable
            onPress={() => setDancerName(nameDraft)}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.saveText}>Сохранить</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Практика</Text>
          <Text style={styles.panelCopy}>{formatTime(practiceSeconds)}</Text>
          <Text style={styles.hint}>
            За каждые 30 секунд практики под метроном — +1 ★
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
  brand: {
    fontFamily: fonts.brand,
    fontSize: 36,
    color: colors.gold,
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
    backgroundColor: 'rgba(18,35,58,0.9)',
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
    backgroundColor: 'rgba(18,35,58,0.9)',
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
  input: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  saveBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.coral,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 14,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(244,247,251,0.12)',
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
