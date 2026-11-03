import { useEvent, useEventListener } from 'expo';
import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from './Text';
import { ChevronIcon, PauseIcon, PlayIcon, SoundIcon } from './icons';
import { colors, fonts, spacing } from '../theme';

type Props = {
  label?: string;
  /** Local require('./file.mp4') */
  source: number;
  /** Still frame shown while the player is not on screen or still loading. */
  poster?: ImageSourcePropType;
  /** Свёрнутый вид по умолчанию: на экране урока видео не должно съедать пол-экрана. */
  startCollapsed?: boolean;
};

/** Длительность плавного появления/скрытия плаката. */
const FADE_MS = 180;
/** За сколько до конца ролика закрываем кадр, чтобы шов цикла не был чёрным. */
const SEAM_LEAD = 0.35;

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Липкий видео-плеер урока: играет по кругу, но его можно свернуть в одну
 * строку и перемотать по полосе прогресса.
 *
 * Android specifics handled here:
 *  - `surfaceType="textureView"` keeps the video inside the view hierarchy;
 *    the default SurfaceView lives on its own layer and flashes black whenever
 *    the screen slides.
 *  - A still poster sits *under* the player surface, so any frame the decoder
 *    drops (seek, buffer refill, surface re-attach) reveals the dance artwork
 *    instead of a black rectangle.
 *  - The loading veil is only allowed during the very first load. ExoPlayer
 *    reports `loading` again on every buffer refill, and reacting to it made
 *    the video blink to the poster in the middle of playback.
 *  - Native stack detaches/clears the surface of the outgoing screen, so the
 *    poster covers the player as soon as the screen loses focus.
 *
 * Native controls are disabled on purpose: their auto-show scrim blinked on
 * every loop. The bar below has small custom controls instead.
 */
export function LessonVideo({
  label,
  source,
  poster,
  startCollapsed = false,
}: Props) {
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(!startCollapsed);
  const [focused, setFocused] = useState(false);
  const [veiled, setVeiled] = useState(true);
  const [stalled, setStalled] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const focusedRef = useRef(false);
  /** Кадр уже показывали хотя бы раз: после этого плакат не перекрывает видео. */
  const startedRef = useRef(false);
  const seamTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fade = useRef(new Animated.Value(1)).current;
  focusedRef.current = focused;

  const player = useVideoPlayer(source, (p) => {
    // Looping with the native repeat mode makes ExoPlayer seek to zero, which
    // drops the surface for a frame. We restart manually behind the poster
    // instead (see playToEnd below), so the seam stays invisible.
    p.loop = false;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
    // No custom bufferOptions on purpose: the time-prioritised 5 s buffer
    // allocated memory by duration, which made ExoPlayer refill the buffer
    // every few seconds (that was the black/poster blinking).
  });

  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });
  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });
  const ready = status === 'readyToPlay';

  /** Показ/скрытие плаката с плавной непрозрачностью, без «прыжков» layout. */
  const showCover = useCallback(
    (immediate = false) => {
      setVeiled(true);
      if (revealTimer.current) {
        clearTimeout(revealTimer.current);
        revealTimer.current = null;
      }
      if (immediate) {
        fade.setValue(1);
        return;
      }
      Animated.timing(fade, {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start();
    },
    [fade],
  );

  const hideCover = useCallback(
    (delay = 0) => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      revealTimer.current = setTimeout(() => {
        revealTimer.current = null;
        if (!focusedRef.current) return;
        startedRef.current = true;
        Animated.timing(fade, {
          toValue: 0,
          duration: FADE_MS,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setVeiled(false);
        });
      }, delay);
    },
    [fade],
  );

  /**
   * In dev the videos are streamed from the Metro server. If it is not running
   * (or the port changed), ExoPlayer fails and `status` becomes 'error' - the
   * player will never recover on its own, so the cover must say so instead of
   * spinning «Видео загружается…» forever.
   */
  const broken = status === 'error' || (!ready && stalled);

  useEffect(() => {
    if (ready) {
      setStalled(false);
      return;
    }
    if (!focused) return;
    const timer = setTimeout(() => setStalled(true), 20000);
    return () => clearTimeout(timer);
  }, [focused, ready]);

  // Фатальная ошибка: закрываем кадр сообщением и кнопкой «Повторить».
  useEffect(() => {
    if (broken) showCover(true);
  }, [broken, showCover]);

  // Первый кадр: держим плакат, пока декодер реально не отдаст картинку.
  useEffect(() => {
    if (!focused) {
      showCover(true);
      return;
    }
    if (!ready) return;
    hideCover(260);
    return () => {
      if (revealTimer.current) {
        clearTimeout(revealTimer.current);
        revealTimer.current = null;
      }
    };
  }, [focused, ready, showCover, hideCover]);

  // Начало проигрывания, как только появился первый кадр.
  useEffect(() => {
    if (!ready) return;
    try {
      player.play();
    } catch {
      // ignore playback races
    }
  }, [ready, player]);

  const restart = useCallback(() => {
    setStalled(false);
    setVeiled(true);
    fade.setValue(1);
    startedRef.current = false;
    try {
      player.currentTime = 0;
      player.play();
    } catch {
      // ignore playback races
    }
  }, [player, fade]);

  // Смена кадра на стыке: перекрываем заранее, иначе видно чёрный провал.
  useEventListener(player, 'timeUpdate', () => {
    if (!focusedRef.current || !startedRef.current) return;
    const total = player.duration;
    if (total > 0) {
      setDuration(total);
      setPosition(player.currentTime);
    }
    if (!total || total <= 0) return;
    if (player.currentTime >= total - SEAM_LEAD) {
      showCover();
    }
  });

  useEventListener(player, 'playToEnd', () => {
    if (!focusedRef.current) return;
    showCover();
    if (seamTimer.current) clearTimeout(seamTimer.current);
    seamTimer.current = setTimeout(() => {
      seamTimer.current = null;
      if (!focusedRef.current) return;
      try {
        player.currentTime = 0;
        player.play();
      } catch {
        // ignore playback races
      }
      hideCover(160);
    }, 70);
  });

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      startedRef.current = false;
      showCover(true);
      try {
        // Coming back to a finished video: rewind so play() actually starts it.
        if (player.duration > 0 && player.currentTime >= player.duration - 0.2) {
          player.currentTime = 0;
        }
        player.play();
      } catch {
        // ignore
      }

      return () => {
        setFocused(false);
        startedRef.current = false;
        showCover(true);
        if (seamTimer.current) {
          clearTimeout(seamTimer.current);
          seamTimer.current = null;
        }
        try {
          player.pause();
        } catch {
          // ignore
        }
      };
    }, [player, showCover]),
  );

  useEffect(() => {
    return () => {
      if (seamTimer.current) clearTimeout(seamTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  const onRetry = () => {
    restart();
    player
      .replaceAsync(source)
      .then(() => {
        try {
          player.currentTime = 0;
          player.play();
        } catch {
          // ignore playback races
        }
      })
      .catch(() => undefined);
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

  const togglePlay = () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch {
      // ignore
    }
  };

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  /** Перемотка по полосе: тап в любом месте дорожки. */
  const seekTo = (ratio: number) => {
    if (!duration || duration <= 0) return;
    const next = Math.max(0, Math.min(1, ratio)) * duration;
    try {
      player.currentTime = next;
      setPosition(next);
      if (!isPlaying) player.play();
    } catch {
      // ignore
    }
  };

  // Смена «свёрнуто/развёрнуто»: поверхность видео пересоздаётся драйвером,
  // поэтому на время перехода снова показываем плакат и лишь потом открываем кадр.
  useEffect(() => {
    if (!expanded) return;
    if (!focused) return;
    showCover(true);
    hideCover(420);
  }, [expanded, focused, showCover, hideCover]);

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <View style={styles.wrap} collapsable={false}>
      {/*
        Видео не размонтируем при сворачивании: у ExoPlayer это оборачивается
        чёрным кадром при повторном открытии. Держим блок смонтированным и
        просто убираем его высоту.
      */}
      <View
        style={[styles.collapsible, !expanded && styles.collapsed]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        <View style={styles.videoShell} collapsable={false}>
          <View style={styles.videoWrap}>
            {/* Подложка под поверхностью видео: любой пропущенный кадр показывает
                афишу танца, а не чёрный прямоугольник. */}
            {poster ? (
              <Image
                source={poster}
                style={styles.underPoster}
                resizeMode="cover"
              />
            ) : null}
            <VideoView
              style={styles.video}
              player={player}
              surfaceType="textureView"
              contentFit="contain"
              nativeControls={false}
              playsInline
              allowsVideoFrameAnalysis={false}
            />
          </View>
          <Animated.View
            style={[styles.cover, { opacity: fade }]}
            pointerEvents={veiled ? (broken ? 'auto' : 'none') : 'none'}
          >
            {poster ? (
              <Image
                source={poster}
                style={styles.coverImage}
                resizeMode="cover"
                blurRadius={14}
              />
            ) : null}
            <View style={styles.coverShade} />
            {broken ? (
              <View style={styles.coverMessage}>
                <Text style={styles.coverText}>Видео не загрузилось</Text>
                <Text style={styles.coverHint}>
                  Проверь подключение к серверу разработки и попробуй ещё раз
                </Text>
                <Pressable
                  onPress={onRetry}
                  accessibilityRole="button"
                  accessibilityLabel="Повторить загрузку видео"
                  style={({ pressed }) => [
                    styles.retryBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.retryText}>Повторить</Text>
                </Pressable>
              </View>
            ) : !ready ? (
              <Text style={styles.coverText}>Видео загружается…</Text>
            ) : null}
          </Animated.View>
        </View>

        {/* Полоса перемотки: сразу видно, что это ролик, а не афиша. */}
        <Pressable
          onLayout={onTrackLayout}
          onPress={(event) => {
            if (!trackWidth) return;
            seekTo(event.nativeEvent.locationX / trackWidth);
          }}
          accessibilityRole="adjustable"
          accessibilityLabel="Перемотка видео"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          style={styles.track}
        >
          <View style={styles.trackBase} />
          <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.trackKnob, { left: `${progress * 100}%` }]} />
        </Pressable>
      </View>

      <View style={styles.bar}>
        <Pressable
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Пауза' : 'Смотреть видео'}
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
        >
          {isPlaying ? (
            <PauseIcon size={18} color={colors.ink} />
          ) : (
            <PlayIcon size={18} color={colors.ink} />
          )}
        </Pressable>
        <View style={styles.titles}>
          <Text style={styles.label} numberOfLines={1}>
            {label ?? 'Видео'}
          </Text>
          <Text style={styles.time}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
        {expanded ? (
          <Pressable
            onPress={toggleMute}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Включить звук' : 'Выключить звук'}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              !muted && styles.iconBtnOn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <SoundIcon size={18} muted={muted} color={muted ? colors.muted : colors.cyan} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Свернуть видео' : 'Развернуть видео'}
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
        >
          <ChevronIcon size={18} up={!expanded} color={colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  videoShell: {
    width: '100%',
    // Все демо-ролики 854×480: держим тот же кадр, чтобы не было чёрных полей.
    aspectRatio: 16 / 9,
    // Не чёрный: даже при полностью погашенной поверхности виден фон панели.
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  collapsible: {
    overflow: 'hidden',
  },
  collapsed: {
    height: 0,
    opacity: 0,
  },
  videoWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  underPoster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Never black: even before the poster bitmap decodes this is a brand panel.
    backgroundColor: colors.bgElevated,
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  coverShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 8, 42, 0.35)',
  },
  coverText: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 13,
  },
  coverMessage: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
  },
  coverHint: {
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    opacity: 0.8,
  },
  retryBtn: {
    marginTop: 2,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.14)',
  },
  retryText: {
    fontFamily: fonts.bodyExtra,
    color: colors.cyan,
    fontSize: 13,
  },
  track: {
    height: 18,
    justifyContent: 'center',
    paddingHorizontal: 0,
    backgroundColor: colors.panel,
  },
  trackBase: {
    height: 4,
    backgroundColor: colors.track,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: colors.cyan,
  },
  trackKnob: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 6,
    backgroundColor: colors.cyan,
  },
  bar: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(247,251,255,0.06)',
  },
  iconBtnOn: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.14)',
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
  },
  time: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
  },
});
