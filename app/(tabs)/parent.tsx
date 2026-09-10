import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../../src/components/StageBackground';
import { useParent } from '../../src/context/ParentContext';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { colors, fonts, spacing } from '../../src/theme';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  return `${m} мин`;
}

function PinPad({
  title,
  subtitle,
  onSubmit,
  cta,
}: {
  title: string;
  subtitle: string;
  onSubmit: (pin: string) => Promise<void> | void;
  cta: string;
}) {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  const push = async (digit: string) => {
    if (pin.length >= 4 || busy) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setBusy(true);
      try {
        await onSubmit(next);
      } finally {
        setPin('');
        setBusy(false);
      }
    }
  };

  return (
    <View style={styles.pinWrap}>
      <Text style={styles.pinTitle}>{title}</Text>
      <Text style={styles.pinSub}>{subtitle}</Text>
      <View style={styles.dots}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < pin.length && styles.dotFilled]}
          />
        ))}
      </View>
      <View style={styles.pad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(
          (key) => (
            <Pressable
              key={key || 'empty'}
              disabled={!key || busy}
              onPress={() => {
                if (key === '⌫') setPin((p) => p.slice(0, -1));
                else if (key) push(key);
              }}
              style={({ pressed }) => [
                styles.key,
                !key && styles.keyEmpty,
                pressed && key && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ),
        )}
      </View>
      <Text style={styles.pinCta}>{cta}</Text>
    </View>
  );
}

export default function ParentScreen() {
  const insets = useSafeAreaInsets();
  const parent = useParent();
  const progress = useProgress();
  const [nameDraft, setNameDraft] = useState(parent.parentName);
  const [goalDraft, setGoalDraft] = useState(String(parent.dailyGoalMinutes));
  const [error, setError] = useState('');

  const dailySeconds = parent.dailyGoalMinutes * 60;
  const todayRatio = Math.min(
    1,
    progress.practiceSeconds / Math.max(dailySeconds, 1),
  );

  if (!parent.ready) {
    return (
      <StageBackground>
        <View />
      </StageBackground>
    );
  }

  if (!parent.hasPin) {
    return (
      <StageBackground>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.lg, paddingBottom: 40 },
          ]}
        >
          <Text style={styles.brand}>MoreDance</Text>
          <Text style={styles.title}>Аккаунт родителя</Text>
          <Text style={styles.copy}>
            Создай PIN из 4 цифр. Дети не смогут открыть настройки и сброс
            прогресса без кода.
          </Text>
          <PinPad
            title="Новый PIN"
            subtitle="Запомни код — он хранится только на этом телефоне"
            cta="Введи 4 цифры"
            onSubmit={async (pin) => {
              const ok = await parent.setupPin(pin);
              if (!ok) setError('PIN должен быть из 4 цифр');
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </StageBackground>
    );
  }

  if (!parent.isUnlocked) {
    return (
      <StageBackground>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.lg, paddingBottom: 40 },
          ]}
        >
          <Text style={styles.brand}>MoreDance</Text>
          <Text style={styles.title}>Вход для родителя</Text>
          <PinPad
            title="PIN-код"
            subtitle={`Здравствуй, ${parent.parentName}`}
            cta="Сессия откроется на 15 минут"
            onSubmit={async (pin) => {
              const ok = await parent.unlock(pin);
              setError(ok ? '' : 'Неверный PIN');
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </StageBackground>
    );
  }

  return (
    <StageBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>MoreDance</Text>
            <Text style={styles.title}>Кабинет родителя</Text>
          </View>
          <Pressable onPress={parent.lock} style={styles.lockBtn}>
            <Text style={styles.lockText}>Выйти</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Ребёнок: {progress.dancerName}</Text>
          <Text style={styles.statLine}>
            Уровень {progress.level} · {progress.stars} ★ · уроков{' '}
            {progress.completedLessons.length}/{progress.totalLessons}
          </Text>
          <Text style={styles.statLine}>
            Практика всего: {formatTime(progress.practiceSeconds)} · камера:{' '}
            {formatTime(progress.cameraPracticeSeconds)}
          </Text>
          <Text style={styles.statLine}>
            Средняя оценка поз: {progress.averagePoseScore}%
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.round(todayRatio * 100)}%` }]} />
          </View>
          <Text style={styles.hint}>
            К цели {parent.dailyGoalMinutes} мин/день: {Math.round(todayRatio * 100)}%
            от накопленной практики
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Имя родителя</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.panelTitle}>Цель практики (мин/день)</Text>
          <TextInput
            value={goalDraft}
            onChangeText={setGoalDraft}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <Pressable
            onPress={async () => {
              await parent.setParentName(nameDraft);
              await parent.setDailyGoalMinutes(Number(goalDraft) || 15);
            }}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.primaryText}>Сохранить настройки</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Прогресс по танцам</Text>
        {dances.map((dance) => {
          const p = progress.danceProgress(dance.id);
          return (
            <View key={dance.id} style={styles.row}>
              <Text style={styles.rowTitle}>{dance.name}</Text>
              <Text style={styles.rowMeta}>
                {p.done}/{p.total}
              </Text>
            </View>
          );
        })}

        <Pressable
          onPress={() =>
            Alert.alert(
              'Сбросить прогресс ребёнка?',
              'Уроки, звёзды и оценки поз обнулятся. Имя сохранится.',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'Сбросить',
                  style: 'destructive',
                  onPress: () => progress.resetProgress(),
                },
              ],
            )
          }
          style={({ pressed }) => [styles.danger, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.dangerText}>Сбросить прогресс</Text>
        </Pressable>

        <Link href="/dances" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.linkText}>Открыть каталог танцев →</Text>
          </Pressable>
        </Link>
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
    fontSize: 34,
    color: colors.gold,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 26,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  copy: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  lockBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lockText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  panel: {
    backgroundColor: 'rgba(18,35,58,0.92)',
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  panelTitle: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 16,
    marginBottom: 8,
  },
  statLine: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
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
  input: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  primary: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
  },
  section: {
    fontFamily: fonts.brand,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  rowMeta: {
    fontFamily: fonts.body,
    color: colors.muted,
  },
  danger: {
    marginTop: spacing.lg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.coral,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerText: {
    fontFamily: fonts.bodyExtra,
    color: colors.coral,
  },
  linkBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: fonts.bodyBold,
    color: colors.sky,
  },
  pinWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  pinTitle: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 20,
  },
  pinSub: {
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: 'center',
    marginVertical: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  dotFilled: {
    backgroundColor: colors.gold,
  },
  pad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  key: {
    width: 80,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(18,35,58,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  keyText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 22,
  },
  pinCta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginTop: spacing.md,
  },
  error: {
    fontFamily: fonts.bodyBold,
    color: colors.coral,
    textAlign: 'center',
    marginTop: 8,
  },
});
