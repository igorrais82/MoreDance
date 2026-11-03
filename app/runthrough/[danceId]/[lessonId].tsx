import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
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
import { colors, fonts, radius, spacing, type } from '../../../src/theme';
import { goBack } from '../../../src/lib/nav';

/**
 * Прогон: полторы минуты танца под музыку без остановок.
 * Таймер и подсветка частей идут от темпа урока, музыка — из видео танца.
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
          <Pressable onPress={() => goBack(router)}>
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
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Pressable onPress={() => goBack(router)} style={styles.backBtn}>
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
              {/* До первого старта поверх кадра афиша, а не чёрный экран. */}
              {!running && beats === 0 && !finished ? (
                <Pressable onPress={start} style={styles.videoPoster}>
                  {getDanceImage(dance.id) ? (
                    <Image
                      source={getDanceImage(dance.id)!}
                      style={styles.videoPosterImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={styles.videoPosterPlay}>
                    <Text style={styles.videoPosterGlyph}>▶</Text>
                  </View>
                </Pressable>
              ) : null}
              <View style={styles.videoBar}>
                <Text style={styles.videoLabel} numberOfLines={1}>
                  Музыка: {dance.name}
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
                ? 'Музыка закончилась — прогон пройден'
                : running
                  ? 'Танцуй без остановок: фигура за фигурой по кругу'
                  : `Длительность прогона ${totalMm}:${totalSs} — нажми «Старт»`}
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
                ? 'Прогон пройден: весь танец в темпе. Если ритм сбивался — ничего страшного, на следующем прогоне связка будет держаться ровнее.'
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
    ...type.link,
  },
  en: {
    fontFamily: fonts.brand,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 1,
  },
  title: {
    ...type.screen,
  },
  subtitle: {
    ...type.bodyMuted,
    marginTop: 2,
  },
  videoShell: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.bgElevated,
  },
  videoPoster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Полоса «Музыка: ...» идёт ниже кадра, поэтому афиша закрывает только видео.
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPosterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  videoPosterPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  videoPosterGlyph: {
    fontSize: 18,
    color: colors.ink,
    marginLeft: 3,
  },
  videoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  videoLabel: {
    flex: 1,
    ...type.caption,
    color: colors.ink,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panelSoft,
  },
  smallBtnText: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  timerCard: {
    borderWidth: 1,
    borderRadius: radius.tile,
    backgroundColor: colors.panel,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  timer: {
    ...type.timer,
  },
  timerHint: {
    ...type.small,
    textAlign: 'center',
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  partCard: {
    borderWidth: 1,
    borderRadius: radius.card,
    backgroundColor: colors.panel,
    padding: spacing.md,
    gap: spacing.xs,
  },
  partLabel: {
    ...type.label,
  },
  partTitle: {
    ...type.section,
    fontSize: 21,
    lineHeight: 27,
  },
  partText: {
    ...type.small,
    color: colors.ink,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  actions: {
    gap: 10,
  },
  primaryBtn: {
    borderRadius: radius.card,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryText: {
    ...type.button,
    color: colors.bg,
    fontSize: 17,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.input,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
  },
  ghostText: {
    ...type.strong,
  },
  footnote: {
    ...type.caption,
    textAlign: 'center',
  },
});
