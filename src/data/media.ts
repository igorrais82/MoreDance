export type PoseStance = 'closed' | 'open' | 'forward' | 'back' | 'side';
export type PoseArms = 'frame' | 'free' | 'side' | 'up' | 'bounce';

export type PoseGuide = {
  stance: PoseStance;
  arms: PoseArms;
  cue: string;
  holdSeconds: number;
};

export type LessonMedia = {
  videoUrl: string;
  videoLabel: string;
  pose: PoseGuide;
};

/** Demo clips until real studio videos are uploaded. */
const DEMO = {
  a: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  b: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  c: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  d: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  e: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
};

export const lessonMedia: Record<string, LessonMedia> = {
  'waltz-posture': {
    videoUrl: DEMO.a,
    videoLabel: 'Демо: осанка вальса',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Встань ровно, руки в рамке, макушка вверх',
      holdSeconds: 4,
    },
  },
  'waltz-box': {
    videoUrl: DEMO.a,
    videoLabel: 'Демо: квадрат вальса',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Шаг вперёд левой, корпус смотрит прямо',
      holdSeconds: 3,
    },
  },
  'waltz-rise': {
    videoUrl: DEMO.a,
    videoLabel: 'Демо: подъём вальса',
    pose: {
      stance: 'closed',
      arms: 'frame',
      cue: 'Полупальцы, мягкий подъём без прыжка',
      holdSeconds: 3,
    },
  },
  'cha-rhythm': {
    videoUrl: DEMO.b,
    videoLabel: 'Демо: ритм ча-ча-ча',
    pose: {
      stance: 'open',
      arms: 'side',
      cue: 'Ноги слегка врозь, хлопни ритм корпусом',
      holdSeconds: 3,
    },
  },
  'cha-basic': {
    videoUrl: DEMO.b,
    videoLabel: 'Демо: база ча-ча-ча',
    pose: {
      stance: 'back',
      arms: 'free',
      cue: 'Правая назад, вес полный, улыбка',
      holdSeconds: 3,
    },
  },
  'cha-locks': {
    videoUrl: DEMO.b,
    videoLabel: 'Демо: замки ча-ча-ча',
    pose: {
      stance: 'side',
      arms: 'side',
      cue: 'Лёгкий крест ног сзади — замок',
      holdSeconds: 3,
    },
  },
  'jive-bounce': {
    videoUrl: DEMO.c,
    videoLabel: 'Демо: пружинка джайва',
    pose: {
      stance: 'open',
      arms: 'bounce',
      cue: 'Колени пружинят, пятки чуть оторваны',
      holdSeconds: 4,
    },
  },
  'jive-basic': {
    videoUrl: DEMO.c,
    videoLabel: 'Демо: база джайва',
    pose: {
      stance: 'side',
      arms: 'bounce',
      cue: 'Тройной шаг в сторону с подскоком',
      holdSeconds: 3,
    },
  },
  'jive-kick': {
    videoUrl: DEMO.c,
    videoLabel: 'Демо: кик джайва',
    pose: {
      stance: 'forward',
      arms: 'free',
      cue: 'Невысокий кик вперёд, баланс на опорной',
      holdSeconds: 2,
    },
  },
  'qs-walk': {
    videoUrl: DEMO.d,
    videoLabel: 'Демо: бег квикстепа',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Лёгкий бег на полупальцах',
      holdSeconds: 3,
    },
  },
  'qs-chasse': {
    videoUrl: DEMO.d,
    videoLabel: 'Демо: шассе',
    pose: {
      stance: 'side',
      arms: 'frame',
      cue: 'Шаг — вместе — шаг в сторону',
      holdSeconds: 3,
    },
  },
  'qs-lock': {
    videoUrl: DEMO.d,
    videoLabel: 'Демо: локстеп',
    pose: {
      stance: 'forward',
      arms: 'frame',
      cue: 'Скрест сзади на беге вперёд',
      holdSeconds: 3,
    },
  },
  'samba-bounce': {
    videoUrl: DEMO.e,
    videoLabel: 'Демо: отскок самбы',
    pose: {
      stance: 'open',
      arms: 'bounce',
      cue: 'Непрерывный bounce вверх-вниз',
      holdSeconds: 4,
    },
  },
  'samba-whisk': {
    videoUrl: DEMO.e,
    videoLabel: 'Демо: виск самбы',
    pose: {
      stance: 'side',
      arms: 'free',
      cue: 'В сторону и крест сзади на «и»',
      holdSeconds: 3,
    },
  },
  'samba-volta': {
    videoUrl: DEMO.e,
    videoLabel: 'Демо: вольта',
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
