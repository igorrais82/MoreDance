import { useEvent, useEventListener } from 'expo';
import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from './Text';
import { colors, fonts, spacing } from '../theme';

type Props = {
  label?: string;
  /** Local require('./file.mp4') */
  source: number;
  /** Still frame shown while the player is not on screen or still loading. */
  poster?: ImageSourcePropType;
};

/** Длительность плавного появления/скрытия плаката. */
const FADE_MS = 180;
/** За сколько до конца ролика закрываем кадр, чтобы шов цикла не был чёрным. */
const SEAM_LEAD = 0.35;

/**
 * Sticky looping lesson/dance video player with custom mute/play controls.
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
 * every loop. The bar has small custom controls instead.
 */
export function LessonVideo({ label, source, poster }: Props) {
  const [muted, setMuted] = useState(true);
  const [focused, setFocused] = useState(false);
  const [veiled, setVeiled] = useState(true);
  const [stalled, setStalled] = useState(false);
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
   * spinning "Видео загружается…" forever.
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
    const duration = player.duration;
    if (!duration || duration <= 0) return;
    if (player.currentTime >= duration - SEAM_LEAD) {
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

  return (
    <View style={styles.wrap} collapsable={false}>
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
      <View style={styles.bar}>
        <Text style={styles.label} numberOfLines={1}>
          {label ?? 'Видео'}
        </Text>
        <Pressable
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Пауза' : 'Смотреть'}
          hitSlop={8}
          style={({ pressed }) => [
            styles.controlBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.controlText}>{isPlaying ? 'Пауза' : 'Смотреть'}</Text>
        </Pressable>
        <Pressable
          onPress={toggleMute}
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Включить звук' : 'Выключить звук'}
          hitSlop={8}
          style={({ pressed }) => [
            styles.controlBtn,
            !muted && styles.controlBtnOn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.controlText, !muted && styles.controlTextOn]}>
            {muted ? 'Звук выкл' : 'Звук вкл'}
          </Text>
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
    color: 'rgba(247,251,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
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
  bar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodyExtra,
    color: colors.ink,
    fontSize: 14,
  },
  controlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(247,251,255,0.08)',
  },
  controlBtnOn: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(0,245,255,0.16)',
  },
  controlText: {
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    fontSize: 12,
  },
  controlTextOn: {
    color: colors.cyan,
  },
});
