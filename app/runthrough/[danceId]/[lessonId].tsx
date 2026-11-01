import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StageBackground } from '../../../src/components/StageBackground';
import { Text } from '../../../src/components/Text';
import { useProgress } from '../../../src/context/ProgressContext';
import { getLesson } from '../../../src/data/dances';
import { getDanceImage } from '../../../src/data/danceImages';
import { getDanceVideo } from '../../../src/data/media';
import { colors, fonts, spacing } from '../../../src/theme';

/**
 * Прогон: полторы минуты танца под музыку без остановок.
 * Таймер и подсветка частей идут от темпа урока, музыка - из видео танца.
 */
export default function RunthroughScreen() {
  const { danceId, lessonId } = useLocalSearchParams<{
    danceId: string;
    lessonId: string;
  }>();
  const data = getLesson(danceId, lessonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeLesson, isLessonComplete } = useProgress();

  const videoSource = data ? getDanceVideo(data.dance.id) : undefined;
  const player = useVideoPlayer(videoSource ?? null, (p) => {
    p.loop = true;
    p.muted = false;
  });

  const total = data?.lesson.durationSec ?? 90;
  const bpm = data?.lesson.bpm ?? 84;

  const parts = useMemo(
    () => (data ? data.lesson.steps.filter((s) => s.count !== '★') : []),
    [data],
  );

  const [running, setRunning] = useState(false);
  const [beats, setBeats] = useState(0);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const beatMs = 60000 / bpm;
    const id = setInterval(() => setBeats((b) => b + 1), beatMs);
    return () => clearInterval(id);
  }, [running, bpm]);

  useEffect(() => {
    if (!running || finishedRef.current) return;
    const beatMs = 60000 / bpm;
    if (beats * beatMs < total * 1000) return;

    finishedRef.current = true;
    setRunning(false);
    setFinished(true);
    try {
      player.pause();
    } catch {
      // ignore playback races
    }
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => undefined);
    if (data) completeLesson(data.lesson.id).catch(() => undefined);
  }, [beats, running, bpm, total, player, completeLesson, data]);

  if (!data) {
    return (
      <StageBackground>
        <View style={{ paddingTop: insets.top + 24, paddingHorizontal: 24 }}>
          <Text style={styles.title}>Прогон недоступен</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>Назад</Text>
          </Pressable>
        </View>
      </StageBackground>
    );
  }

  const { dance, lesson } = data;
  const accent = lesson.accent ?? colors.gold;
  const beatMs = 60000 / bpm;
  const passed = Math.min(total, Math.floor((beats * beatMs) / 1000));
  const remaining = Math.max(0, total - passed);
  const partIndex = parts.length ? Math.floor(beats / 3) % parts.length : 0;
  const part = parts[partIndex];
  const done = isLessonComplete(lesson.id);

  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, '0');
  const totalMm = Math.floor(total / 60);
  const totalSs = (total % 60).toString().padStart(2, '0');

  const start = () => {
    if (finished) {
      finishedRef.current = false;
      setBeats(0);
      setFinished(false);
      try {
        player.currentTime = 0;
        player.play();
      } catch {
        // ignore
      }
      setRunning(true);
      return;
    }
    try {
      player.play();
    } catch {
      // ignore
    }
    setRunning(true);
  };

  const pause = () => {
    setRunning(false);
    try {
      player.pause();
    } catch {
      // ignore
    }
  };

  const reset = () => {
    finishedRef.current = false;
    setRunning(false);
    setFinished(false);
    setBeats(0);
    try {
      player.pause();
      player.currentTime = 0;
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try {
      player.muted = next;
    } catch {
      // ignore
    }
  };

  return (
    <StageBackground>
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.back}>← К уроку</Text>
          </Pressable>

          <Text style={[styles.en, { color: accent }]}>{dance.nameEn}</Text>
          <Text style={styles.title}>Прогон</Text>
          <Text style={styles.subtitle}>{lesson.title}</Text>

          {videoSource != null ? (
            <View style={styles.videoShell}>
              <VideoView
                style={styles.video}
                player={player}
                surfaceType="textureView"
                contentFit="cover"
                nativeControls={false}
                playsInline
                allowsVideoFrameAnalysis={false}
              />
              <View style={styles.videoBar}>
                <Text style={styles.videoLabel} numberOfLines={1}>
                  Музыка вальса
                </Text>
                <Pressable
                  onPress={toggleMute}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.smallBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.smallBtnText}>
                    {muted ? 'Звук выкл' : 'Звук вкл'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={[styles.timerCard, { borderColor: accent }]}>
            <Text style={[styles.timer, { color: accent }]}>
              {mm}:{ss}
            </Text>
            <Text style={styles.timerHint}>
              {finished
                ? 'Музыка закончилась - прогон пройден'
                : running
                  ? 'Танцуй без остановок: фигура за фигурой по кругу'
                  : `Длительность прогона ${totalMm}:${totalSs} - нажми «Старт»`}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${total ? Math.round((passed / total) * 100) : 0}%`,
                    backgroundColor: accent,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.partCard, { borderColor: accent }]}>
            <Text style={styles.partLabel}>
              {finished ? 'Финиш' : `Часть ${partIndex + 1} из ${parts.length}`}
            </Text>
            <Text style={[styles.partTitle, { color: accent }]}>
              {finished ? 'Прогон пройден' : (part?.title ?? 'Фигура за фигурой')}
            </Text>
            <Text style={styles.partText}>
              {finished
                ? 'Ты прошла полторы минуты в темпе. Если сбивалась - ничего страшного: на следующем прогоне связка будет держаться ровнее.'
                : (part?.instruction ??
                  'Считай «раз-два-три» на каждую часть и не останавливайся.')}
            </Text>

            <View style={styles.dots}>
              {parts.map((p, i) => (
                <View
                  key={p.title}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        !finished && i === partIndex ? accent : colors.track,
                      borderColor: accent,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={running ? pause : start}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: running ? colors.magenta : accent },
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.primaryText}>
                {running ? 'Пауза' : finished ? 'Пройти ещё раз' : 'Старт'}
              </Text>
            </Pressable>

            {beats > 0 && !running ? (
              <Pressable
                onPress={reset}
                style={({ pressed }) => [
                  styles.ghostBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.ghostText}>Сбросить</Text>
              </Pressable>
            ) : null}

            <Text style={styles.footnote}>
              {done
                ? '★ Прогон уже засчитан'
                : 'Прогон засчитается, когда дойдёшь до конца музыки'}
            </Text>
          </View>
        </ScrollView>
      </View>
    </StageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backBtn: {
    marginBottom: 2,
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
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    marginTop: -4,
  },
  videoShell: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0B0618',
  },
  videoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  videoLabel: {
    flex: 1,
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 14,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(247,251,255,0.08)',
  },
  smallBtnText: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 12,
  },
  timerCard: {
    borderWidth: 2,
    borderRadius: 24,
    backgroundColor: colors.panel,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: 8,
  },
  timer: {
    fontFamily: fonts.brand,
    fontSize: 72,
    lineHeight: 78,
  },
  timerHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
  },
  partCard: {
    borderWidth: 2,
    borderRadius: 18,
    backgroundColor: colors.panelSoft,
    padding: spacing.md,
    gap: 6,
  },
  partLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  partTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 24,
  },
  partText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  actions: {
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.bodyExtra,
    color: colors.bg,
    fontSize: 18,
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
  footnote: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});
