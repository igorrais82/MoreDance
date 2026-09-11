import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Metronome } from '../../../src/components/Metronome';
import { StageBackground } from '../../../src/components/StageBackground';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { colors, fonts, spacing } from '../../../src/theme';

export default function PracticeScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPracticeSeconds, completeLesson, isLessonComplete } = useProgress();

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const startedAt = useRef<number | null>(null);
  const accrued = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startedAt.current != null) {
        setElapsed(accrued.current + Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    return () => {
      const total =
        accrued.current +
        (startedAt.current != null
          ? Math.floor((Date.now() - startedAt.current) / 1000)
          : 0);
      if (total > 0) {
        addPracticeSeconds(total).catch(() => undefined);
      }
    };
  }, [addPracticeSeconds]);

  if (!data) {
    return (
      <StageBackground>
        <View style={{ paddingTop: insets.top + 24, paddingHorizontal: 24 }}>
          <Text style={styles.title}>Практика недоступна</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Назад</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  const { dance, lesson } = data;
  const step = lesson.steps[stepIndex % lesson.steps.length];
  const done = isLessonComplete(lesson.id);

  const toggle = () => {
    if (running) {
      if (startedAt.current != null) {
        accrued.current += Math.floor((Date.now() - startedAt.current) / 1000);
        startedAt.current = null;
      }
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  };

  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, '0');
  const ss = (elapsed % 60).toString().padStart(2, '0');

  return (
    <StageBackground>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>← К уроку</Text>
        </Pressable>

        <Text style={[styles.en, { color: dance.accent }]}>{dance.nameEn}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.timer}>
          {mm}:{ss}
        </Text>

        <View style={styles.metronomeBlock}>
          <Metronome
            bpm={lesson.bpm}
            counts={lesson.counts}
            accent={dance.accent}
            running={running}
            onToggle={toggle}
            onTick={() => setStepIndex((i) => i + 1)}
          />
        </View>

        <View style={styles.cue}>
          <Text style={styles.cueCount}>{step.count}</Text>
          <Text style={styles.cueTitle}>{step.title}</Text>
          <Text style={styles.cueInstruction}>{step.instruction}</Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() =>
              setStepIndex((i) => (i + 1) % lesson.steps.length)
            }
            style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.ghostText}>Следующий шаг</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              if (running) toggle();
              await completeLesson(lesson.id);
            }}
            style={({ pressed }) => [
              styles.doneBtn,
              done && { backgroundColor: colors.mint },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Text style={styles.doneText}>
              {done ? 'Урок выполнен' : 'Завершить урок'}
            </Text>
          </Pressable>
        </View>
      </View>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    marginBottom: spacing.sm,
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 15,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 18,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 26,
    color: colors.ink,
  },
  timer: {
    fontFamily: fonts.brand,
    fontSize: 42,
    color: colors.gold,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  metronomeBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cue: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  cueCount: {
    fontFamily: fonts.brand,
    fontSize: 36,
    color: colors.sky,
    marginBottom: 4,
  },
  cueTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 8,
  },
  cueInstruction: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
  },
  footer: {
    marginTop: spacing.md,
    gap: 10,
  },
  ghostBtn: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostText: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 15,
  },
  doneBtn: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 16,
  },
});
