import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../../src/components/Text';
import { useParent } from '../../src/context/ParentContext';
import { useProgress } from '../../src/context/ProgressContext';
import { dances } from '../../src/data/dances';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s > 0 ? `${m} мин ${s} с` : `${m} мин`;
}

function PinPad({
  title,
  subtitle,
  onSubmit,
  cta,
  footer,
}: {
  title: string;
  subtitle: string;
  onSubmit: (pin: string) => Promise<void> | void;
  cta: string;
  footer?: React.ReactNode;
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
      <Text style={type.section}>{title}</Text>
      <Text style={[type.small, styles.pinSub]}>{subtitle}</Text>
      <View style={styles.dots} accessible accessibilityLabel={`Введено ${pin.length} из 4 цифр`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>
      <View style={styles.pad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) => (
          <Pressable
            key={key || 'empty'}
            disabled={!key || busy}
            onPress={() => {
              if (key === '⌫') setPin((p) => p.slice(0, -1));
              else if (key) push(key);
            }}
            accessibilityRole="button"
            accessibilityLabel={
              !key ? undefined : key === '⌫' ? 'Стереть цифру' : `Цифра ${key}`
            }
            style={({ pressed }) => [
              styles.key,
              !key && styles.keyEmpty,
              pressed && key && styles.pressed,
            ]}
          >
            <Text style={styles.keyText}>{key}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[type.caption, styles.pinCta]}>{cta}</Text>
      {footer}
    </View>
  );
}

export default function ParentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const parent = useParent();
  const progress = useProgress();
  const [nameDraft, setNameDraft] = useState(parent.parentName);
  const [goalDraft, setGoalDraft] = useState(String(parent.dailyGoalMinutes));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const goalSeconds = Math.max(parent.dailyGoalMinutes, 1) * 60;
  const todayRatio = Math.min(1, progress.todayPracticeSeconds / goalSeconds);

  // Экран открывается под сегментами «Профиль | Родитель», внешний отступ уже есть.
  const scrollStops = {
    paddingBottom: insets.bottom + 108,
    paddingTop: spacing.xs,
  };

  const askForgotPin = () => {
    Alert.alert(
      'Забыли PIN?',
      'Код будет удалён, и кабинет попросит придумать новый. Прогресс ребёнка, звёзды и уроки останутся на месте.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить PIN',
          style: 'destructive',
          onPress: () => {
            setError('');
            parent.resetPin().catch(() => undefined);
          },
        },
      ],
    );
  };

  if (!parent.ready) {
    return <View />;
  }

  if (!parent.hasPin) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, scrollStops]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={type.title}>Аккаунт родителя</Text>
          <Text style={[type.small, styles.copy]}>
            Придумай PIN из 4 цифр — он защитит сброс прогресса и настройки. Код
            хранится только на этом телефоне.
          </Text>
          <PinPad
            title="Новый PIN"
            subtitle="Запомни код: восстановить его нельзя, но можно задать заново"
            cta="Введи 4 цифры"
            onSubmit={async (pin) => {
              const ok = await parent.setupPin(pin);
              if (!ok) setError('PIN должен быть из 4 цифр');
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (!parent.isUnlocked) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, scrollStops]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={type.title}>Вход для родителя</Text>
          <PinPad
            title="PIN-код"
            subtitle={`Здравствуй, ${parent.parentName}`}
            cta="Сессия откроется на 15 минут"
            onSubmit={async (pin) => {
              const ok = await parent.unlock(pin);
              setError(ok ? '' : 'Неверный PIN');
            }}
            footer={
              <Pressable
                onPress={askForgotPin}
                accessibilityRole="button"
                accessibilityLabel="Забыли PIN, задать новый"
                style={styles.linkBtn}
              >
                <Text style={type.link}>Забыли PIN?</Text>
              </Pressable>
            }
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, scrollStops]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[type.title, styles.title]}>Кабинет родителя</Text>
          <Pressable
            onPress={parent.lock}
            accessibilityRole="button"
            accessibilityLabel="Выйти из кабинета родителя"
            style={styles.lockBtn}
          >
            <Text style={type.strong}>Выйти</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={type.label}>Ребёнок</Text>
          <Text style={[type.section, styles.panelValue]}>
            {progress.dancerName}
          </Text>
          <Text style={type.small}>
            {progress.rank.title} · {progress.xp} XP · {progress.stars} ★ · уроков{' '}
            {progress.completedLessons.length}/{progress.totalLessons}
          </Text>
        </View>

        <View style={[styles.panel, { borderColor: colors.mint }]}>
          <Text style={type.label}>Сегодня</Text>
          <Text style={[type.section, styles.panelValue]}>
            {formatTime(progress.todayPracticeSeconds)}
          </Text>
          <Text style={type.small}>
            Цель {parent.dailyGoalMinutes} мин в день · выполнено{' '}
            {Math.round(todayRatio * 100)}%
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.round(todayRatio * 100)}%` }]} />
          </View>
          <Text style={[type.caption, styles.panelNote]}>
            Всего практики: {formatTime(progress.practiceSeconds)} · у зеркала:{' '}
            {formatTime(progress.cameraPracticeSeconds)} · серия:{' '}
            {progress.streakDays} дн.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={[type.label, styles.inputLabel]}>Имя родителя</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            style={styles.input}
            placeholder="Как к тебе обращаться"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Имя родителя"
          />
          <Text style={[type.label, styles.inputLabel]}>Цель практики, мин в день</Text>
          <TextInput
            value={goalDraft}
            onChangeText={setGoalDraft}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="Например, 15"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Цель практики в минутах в день"
          />
          <Pressable
            onPress={async () => {
              await parent.setParentName(nameDraft);
              await parent.setDailyGoalMinutes(Number(goalDraft) || 15);
              setGoalDraft(String(Math.min(90, Math.max(5, Math.round(Number(goalDraft) || 15)))));
              setSaved('Настройки сохранены');
            }}
            accessibilityRole="button"
            accessibilityLabel="Сохранить настройки родителя"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={type.button}>Сохранить настройки</Text>
          </Pressable>
          {saved ? <Text style={styles.saved}>{saved}</Text> : null}
        </View>

        <Text style={[type.section, styles.section]}>Прогресс по танцам</Text>
        {dances.map((dance) => {
          const p = progress.danceProgress(dance.id);
          return (
            <View key={dance.id} style={styles.row}>
              <Text style={type.strong}>{dance.name}</Text>
              <Text style={type.caption}>
                {p.done} из {p.total}
              </Text>
            </View>
          );
        })}

        <Pressable
          onPress={() =>
            Alert.alert(
              'Сбросить прогресс ребёнка?',
              'Уроки, звёзды и рекорды обнулятся. Имя сохранится.',
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
          accessibilityRole="button"
          accessibilityLabel="Сбросить прогресс ребёнка"
          style={({ pressed }) => [styles.danger, pressed && styles.pressed]}
        >
          <Text style={styles.dangerText}>Сбросить прогресс</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/dances')}
          accessibilityRole="link"
          accessibilityLabel="Открыть каталог танцев"
          style={styles.linkBtn}
        >
          <Text style={type.link}>Открыть каталог танцев →</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  copy: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
  },
  lockBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.panelSoft,
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
  panelValue: {
    marginBottom: 2,
  },
  panelNote: {
    marginTop: spacing.xs,
  },
  inputLabel: {
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    borderWidth: 1,
    borderColor: colors.line,
  },
  primary: {
    backgroundColor: colors.coral,
    borderRadius: radius.input,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saved: {
    ...type.caption,
    color: colors.mint,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  danger: {
    marginTop: spacing.lg,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.coral,
    paddingVertical: 13,
    alignItems: 'center',
  },
  dangerText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
    lineHeight: 21,
    color: colors.coral,
  },
  linkBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.88,
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
    backgroundColor: colors.mint,
  },
  pinWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pinSub: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
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
    borderRadius: radius.input,
    backgroundColor: colors.panel,
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
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
  },
  pinCta: {
    marginTop: spacing.md,
  },
  error: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 19,
    color: colors.coral,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
