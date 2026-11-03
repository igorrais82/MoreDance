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
 * — waltz:     local — d:\Танцы\Жемчужина Анапы 2026\Артем\1.mp4
 * — cha-cha:   local — d:\Танцы\Жемчужина Анапы 2026\Артем\8.mp4
 * — jive:      local — d:\Танцы\Жемчужина Анапы 2026\Артем\9_1.mp4
 * — quickstep: local — d:\Танцы\Жемчужина Анапы 2026\Артем\3.mp4
 * — samba:     local — d:\Танцы\Жемчужина Анапы 2026\Артем\9_3.mp4
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
  'waltz-about': {
    videoLabel: 'Всё о медленном вальсе',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Стойка вальса: спина прямая, рамка мягкая, макушка вверх',
      holdSeconds: 4,
    },
  },
  'waltz-small-box': {
    videoLabel: 'Маленький квадрат',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Правая вперёд, шаг маленький, корпус смотрит прямо',
      holdSeconds: 3,
    },
  },
  'waltz-big-box': {
    videoLabel: 'Большой квадрат',
    pose: {
      stance: 'side',
      arms: 'frame',
      cue: 'Боковой шаг вместе с поворотом корпуса — смотри на новую сторону зала',
      holdSeconds: 3,
    },
  },
  'waltz-box-combo': {
    videoLabel: 'Квадрат вальса',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Два маленьких квадрата: вперёд, назад, вперёд, назад — без поворотов',
      holdSeconds: 4,
    },
  },
  'waltz-frame': {
    videoLabel: 'Рама и построение корпуса',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Плечи вниз, локти на уровне чуть ниже плеч, предплечья параллельно полу',
      holdSeconds: 5,
    },
  },
  'waltz-rise-fall': {
    videoLabel: 'Спуски и подъёмы',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: '«Раз» — низко, «два-три» — на полупальцы, макушка вверх',
      holdSeconds: 4,
    },
  },
  'waltz-natural-turn': {
    videoLabel: 'Правый поворот',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Правая вперёд с пятки, левая в сторону уже с поворотом, правая вместе',
      holdSeconds: 3,
    },
  },
  'waltz-change': {
    videoLabel: 'Перемена',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Маленький квадрат: вперёд, в сторону, вместе — без поворота',
      holdSeconds: 3,
    },
  },
  'waltz-turn-changes': {
    videoLabel: 'Правый поворот, 2 перемены',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Поворот на два такта, потом две перемены — рама одна и та же',
      holdSeconds: 4,
    },
  },
  'waltz-golden': {
    videoLabel: 'Золотая вариация',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Поворот, перемена, поворот, перемена — рама и ось одни на все четыре такта',
      holdSeconds: 4,
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
  'qs-about': {
    videoLabel: 'Всё о квикстепе',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Стойка квикстепа: спина прямая, рама мягкая, вес чуть вперёд',
      holdSeconds: 4,
    },
  },
  'qs-slow-quick': {
    videoLabel: 'Счёт слоу и квик',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Слоу — шаг длиннее, квик — короче: колени мягкие, корпус спокойный',
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
