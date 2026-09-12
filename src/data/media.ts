export type PoseStance = 'closed' | 'open' | 'forward' | 'back' | 'side';
export type PoseArms = 'frame' | 'free' | 'side' | 'up' | 'bounce';

export type PoseGuide = {
  stance: PoseStance;
  arms: PoseArms;
  cue: string;
  holdSeconds: number;
};

export type LessonMedia = {
  /**
   * Optional override. By default the lesson uses the dance video from
   * `danceVideos` via `getDanceVideo(danceId)`.
   */
  videoSource?: number;
  videoLabel: string;
  pose: PoseGuide;
};

/** One looping demo video per dance — replace files in assets/videos anytime.
 *
 * Current free Mixkit stock sources (personal/demo use):
 * - waltz:     local — d:\Танцы\Жемчужина Анапы 2026\Артем\1.mp4
 * - cha-cha:   local — d:\Танцы\Жемчужина Анапы 2026\Артем\8.mp4
 * - jive:      local — d:\Танцы\Жемчужина Анапы 2026\Артем\9_1.mp4
 * - quickstep: local — d:\Танцы\Жемчужина Анапы 2026\Артем\3.mp4
 * - samba:     local — d:\Танцы\Жемчужина Анапы 2026\Артем\9_3.mp4
 */
export const danceVideos: Record<string, number> = {
  waltz: require('../../assets/videos/waltz.mp4'),
  'cha-cha': require('../../assets/videos/cha-cha.mp4'),
  jive: require('../../assets/videos/jive.mp4'),
  quickstep: require('../../assets/videos/quickstep.mp4'),
  samba: require('../../assets/videos/samba.mp4'),
};

export function getDanceVideo(danceId: string): number | undefined {
  return danceVideos[danceId];
}

export const lessonMedia: Record<string, LessonMedia> = {
  'waltz-posture': {
    videoLabel: 'Осанка вальса',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Встань ровно, руки в рамке, макушка вверх',
      holdSeconds: 4,
    },
  },
  'waltz-box': {
    videoLabel: 'Квадрат вальса',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Шаг вперёд левой, корпус смотрит прямо',
      holdSeconds: 3,
    },
  },
  'waltz-rise': {
    videoLabel: 'Подъём вальса',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Полупальцы, мягкий подъём без прыжка',
      holdSeconds: 3,
    },
  },
  'cha-rhythm': {
    videoLabel: 'Ритм ча-ча-ча',
    pose: {
      stance: 'open',
      arms: 'side',
      cue: 'Ноги слегка врозь, хлопни ритм корпусом',
      holdSeconds: 3,
    },
  },
  'cha-basic': {
    videoLabel: 'База ча-ча-ча',
    pose: {
      stance: 'back',
      arms: 'free',
      cue: 'Правая назад, вес полный, улыбка',
      holdSeconds: 3,
    },
  },
  'cha-locks': {
    videoLabel: 'Замки ча-ча-ча',
    pose: {
      stance: 'side',
      arms: 'side',
      cue: 'Лёгкий крест ног сзади — замок',
      holdSeconds: 3,
    },
  },
  'jive-bounce': {
    videoLabel: 'Пружинка джайва',
    pose: {
      stance: 'open',
      arms: 'bounce',
      cue: 'Колени пружинят, пятки чуть оторваны',
      holdSeconds: 4,
    },
  },
  'jive-basic': {
    videoLabel: 'База джайва',
    pose: {
      stance: 'side',
      arms: 'bounce',
      cue: 'Тройной шаг в сторону с подскоком',
      holdSeconds: 3,
    },
  },
  'jive-kick': {
    videoLabel: 'Кик джайва',
    pose: {
      stance: 'forward',
      arms: 'free',
      cue: 'Невысокий кик вперёд, баланс на опорной',
      holdSeconds: 2,
    },
  },
  'qs-walk': {
    videoLabel: 'Бег квикстепа',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Лёгкий бег на полупальцах',
      holdSeconds: 3,
    },
  },
  'qs-chasse': {
    videoLabel: 'Шассе квикстепа',
    pose: {
      stance: 'side',
      arms: 'frame',
      cue: 'Шаг — вместе — шаг в сторону',
      holdSeconds: 3,
    },
  },
  'qs-lock': {
    videoLabel: 'Локстеп',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Скрест сзади на беге вперёд',
      holdSeconds: 3,
    },
  },
  'samba-bounce': {
    videoLabel: 'Отскок самбы',
    pose: {
      stance: 'open',
      arms: 'bounce',
      cue: 'Непрерывный bounce вверх-вниз',
      holdSeconds: 4,
    },
  },
  'samba-whisk': {
    videoLabel: 'Виск самбы',
    pose: {
      stance: 'side',
      arms: 'free',
      cue: 'В сторону и крест сзади на «и»',
      holdSeconds: 3,
    },
  },
  'samba-volta': {
    videoLabel: 'Вольта',
    pose: {
      stance: 'forward',
      arms: 'up',
      cue: 'Диагональ вперёд с поворотом взгляда',
      holdSeconds: 3,
    },
  },
};

export function getLessonMedia(lessonId: string): LessonMedia | undefined {
  return lessonMedia[lessonId];
}
