export type DanceStyle = 'standard' | 'latin';
export type Difficulty = 'beginner' | 'easy' | 'medium';

export type LessonStep = {
  count: string;
  title: string;
  instruction: string;
};

export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  summary: string;
  tip: string;
  steps: LessonStep[];
  bpm: number;
  counts: string[];
};

export type Dance = {
  id: string;
  name: string;
  nameEn: string;
  style: DanceStyle;
  difficulty: Difficulty;
  accent: string;
  mood: string;
  bpm: number;
  timeSignature: string;
  description: string;
  whyKidsLoveIt: string;
  lessons: Lesson[];
};

export const dances: Dance[] = [
  {
    id: 'waltz',
    name: 'Медленный вальс',
    nameEn: 'Waltz',
    style: 'standard',
    difficulty: 'beginner',
    accent: '#00F5FF',
    mood: 'Плавный и торжественный',
    bpm: 84,
    timeSignature: '3/4',
    description:
      'Король бальных танцев. Мягкое кружение в три счёта учит держать осанку и двигаться вместе с музыкой.',
    whyKidsLoveIt: 'Похоже на полёт — шаги мягкие, а платье или смокинг будто сами кружатся.',
    lessons: [
      {
        id: 'waltz-posture',
        title: 'Королевская осанка',
        durationMin: 4,
        summary: 'Учимся стоять красиво: спина прямая, плечи мягкие, взгляд вперёд.',
        tip: 'Представь, что на голове корона — она не должна упасть.',
        bpm: 72,
        counts: ['1', '2', '3'],
        steps: [
          {
            count: 'Старт',
            title: 'Стойка',
            instruction: 'Ноги вместе, стопы параллельно. Живот слегка подтянут, улыбка лёгкая.',
          },
          {
            count: '1',
            title: 'Вдох вверх',
            instruction: 'Подними грудную клетку на вдохе, будто становишься выше на ладонь.',
          },
          {
            count: '2–3',
            title: 'Мягкие плечи',
            instruction: 'Опусти плечи вниз и назад. Руки готовы к партнёрской рамке.',
          },
        ],
      },
      {
        id: 'waltz-box',
        title: 'Квадрат вальса',
        durationMin: 7,
        summary: 'Базовый «квадрат»: вперёд — сторону — вместе, назад — сторону — вместе.',
        tip: 'Считай вслух: раз-два-три. На «раз» шаг длиннее.',
        bpm: 84,
        counts: ['1', '2', '3'],
        steps: [
          {
            count: '1',
            title: 'Вперёд левой',
            instruction: 'Левая нога шагает вперёд. Перенеси вес полностью.',
          },
          {
            count: '2',
            title: 'В сторону правой',
            instruction: 'Правая нога в сторону. Колени мягкие, без прыжка.',
          },
          {
            count: '3',
            title: 'Вместе',
            instruction: 'Левая нога подходит к правой. Пауза на музыке.',
          },
          {
            count: '1',
            title: 'Назад правой',
            instruction: 'Правая нога назад. Смотри прямо, не в пол.',
          },
          {
            count: '2',
            title: 'В сторону левой',
            instruction: 'Левая в сторону — такой же размер шага, как раньше.',
          },
          {
            count: '3',
            title: 'Закрыли',
            instruction: 'Правая подходит к левой. Квадрат готов!',
          },
        ],
      },
      {
        id: 'waltz-rise',
        title: 'Подъём и снижение',
        durationMin: 6,
        summary: 'Вальс «дышит»: на 2–3 поднимаемся, на 1 мягко опускаемся.',
        tip: 'Не прыгай — это волна, а не батут.',
        bpm: 84,
        counts: ['1', '2', '3'],
        steps: [
          {
            count: '1',
            title: 'Мягко вниз',
            instruction: 'Шаг на почти плоской стопе, колени чуть согнуты.',
          },
          {
            count: '2',
            title: 'Растём',
            instruction: 'Через полупальцы поднимайся вверх, корпус спокойный.',
          },
          {
            count: '3',
            title: 'Держим высоту',
            instruction: 'Закрой ноги наверху и готовься мягко опуститься на следующий «раз».',
          },
        ],
      },
    ],
  },
  {
    id: 'cha-cha',
    name: 'Ча-ча-ча',
    nameEn: 'Cha-Cha-Cha',
    style: 'latin',
    difficulty: 'easy',
    accent: '#FF4DC4',
    mood: 'Игривый и чёткий',
    bpm: 120,
    timeSignature: '4/4',
    description:
      'Латинский хит с весёлым «ча-ча-ча». Учит ритму, быстрым ногам и уверенной улыбке.',
    whyKidsLoveIt: 'Можно чуть покачать бёдрами и хлопать в ладоши под счёт.',
    lessons: [
      {
        id: 'cha-rhythm',
        title: 'Ритм ча-ча-ча',
        durationMin: 5,
        summary: 'Считаем: 2, 3, 4-и-1. Именно здесь рождается знаменитое «ча-ча-ча».',
        tip: 'Прохлопай ритм ладошками, прежде чем шагать ногами.',
        bpm: 112,
        counts: ['2', '3', '4', '&', '1'],
        steps: [
          {
            count: '2',
            title: 'Шаг',
            instruction: 'Правая назад (или левая вперёд — выбери ведущую ногу на сегодня).',
          },
          {
            count: '3',
            title: 'Замена',
            instruction: 'Верни вес на другую ногу. Движение короткое и точное.',
          },
          {
            count: '4 & 1',
            title: 'Ча-ча-ча',
            instruction: 'Три быстрых шага на месте в сторону: ча — ча — ча.',
          },
        ],
      },
      {
        id: 'cha-basic',
        title: 'Базовый ход',
        durationMin: 8,
        summary: 'Соединяем шаги вперёд/назад с ча-ча-ча в сторону.',
        tip: 'Носки чуть развёрнуты наружу — так легче держать баланс.',
        bpm: 120,
        counts: ['2', '3', '4', '&', '1'],
        steps: [
          {
            count: '2',
            title: 'Назад',
            instruction: 'Правая нога назад, пятка чуть приподнята.',
          },
          {
            count: '3',
            title: 'На место',
            instruction: 'Левая остаётся, вес возвращается вперёд на неё.',
          },
          {
            count: '4 & 1',
            title: 'В сторону',
            instruction: 'Ча-ча-ча вправо: правая — левая — правая.',
          },
          {
            count: '2',
            title: 'Вперёд',
            instruction: 'Левая вперёд. Колено мягкое.',
          },
          {
            count: '3',
            title: 'На место',
            instruction: 'Вес на правую.',
          },
          {
            count: '4 & 1',
            title: 'Ча-ча-ча влево',
            instruction: 'Левая — правая — левая. Улыбнись на последний «ча»!',
          },
        ],
      },
      {
        id: 'cha-locks',
        title: 'Замки ног',
        durationMin: 6,
        summary: 'Учимся «запирать» ноги для чистой латины.',
        tip: 'Представь, что между коленями тонкая пружинка — она пружинит, но не ломается.',
        bpm: 118,
        counts: ['2', '3', '4', '&', '1'],
        steps: [
          {
            count: '2–3',
            title: 'Шаг-замена',
            instruction: 'Сделай обычный шаг и замену, стопы близко к полу.',
          },
          {
            count: '4 &',
            title: 'Скрестили',
            instruction: 'На ча-ча слегка скрести ноги сзади — это и есть замок.',
          },
          {
            count: '1',
            title: 'Открыли',
            instruction: 'Открой стопы в сторону и зафиксируй позу на долю секунды.',
          },
        ],
      },
    ],
  },
  {
    id: 'jive',
    name: 'Джайв',
    nameEn: 'Jive',
    style: 'latin',
    difficulty: 'easy',
    accent: '#FFD84A',
    mood: 'Быстрый и солнечный',
    bpm: 168,
    timeSignature: '4/4',
    description:
      'Самый весёлый танец программы. Прыгучий ритм, улыбки и энергия рок-н-ролла.',
    whyKidsLoveIt: 'Можно подпрыгивать! Главное — не забывать про счёт.',
    lessons: [
      {
        id: 'jive-bounce',
        title: 'Пружинка джайва',
        durationMin: 4,
        summary: 'Колени постоянно мягко пружинят — это сердце джайва.',
        tip: 'Пятки часто чуть оторваны от пола, как у весёлых кроссовок.',
        bpm: 140,
        counts: ['1', '2', '3', '4'],
        steps: [
          {
            count: '1–2',
            title: 'Пружина',
            instruction: 'На месте мягко сгибай и разгибай колени в ритме.',
          },
          {
            count: '3–4',
            title: 'Добавь руки',
            instruction: 'Руки свободно качаются, локти рядом с корпусом.',
          },
        ],
      },
      {
        id: 'jive-basic',
        title: 'База джайва',
        durationMin: 8,
        summary: 'Шаг-шаг + тройной шаг вправо и влево.',
        tip: 'Начинай медленнее метронома, потом ускоряйся.',
        bpm: 152,
        counts: ['1', '2', '3', 'a', '4', '3', 'a', '4'],
        steps: [
          {
            count: '1',
            title: 'Шаг левой',
            instruction: 'Левая назад или на месте — короткий шаг.',
          },
          {
            count: '2',
            title: 'Шаг правой',
            instruction: 'Правая на месте, пружина в коленях.',
          },
          {
            count: '3 a 4',
            title: 'Тройка вправо',
            instruction: 'Правая — левая — правая с лёгким подскоком.',
          },
          {
            count: '3 a 4',
            title: 'Тройка влево',
            instruction: 'Левая — правая — левая. Держи ритм одинаковым.',
          },
        ],
      },
      {
        id: 'jive-kick',
        title: 'Кик и точка',
        durationMin: 6,
        summary: 'Добавляем весёлый кик ногой без потери баланса.',
        tip: 'Кик невысокий — до уровня икры партнёра по воображению.',
        bpm: 148,
        counts: ['1', '2', '3', '4'],
        steps: [
          {
            count: '1',
            title: 'Кик',
            instruction: 'Лёгкий кик правой вперёд, носок натянут.',
          },
          {
            count: '2',
            title: 'Точка',
            instruction: 'Поставь ногу рядом, вес на опорную.',
          },
          {
            count: '3–4',
            title: 'Пружина',
            instruction: 'Вернись в базовую пружинку и улыбнись судьям!',
          },
        ],
      },
    ],
  },
  {
    id: 'quickstep',
    name: 'Квикстеп',
    nameEn: 'Quickstep',
    style: 'standard',
    difficulty: 'medium',
    accent: '#2EE6C5',
    mood: 'Лёгкий и стремительный',
    bpm: 200,
    timeSignature: '4/4',
    description:
      'Быстрый стандарт с бегом и лёгкими прыжками. Учит лёгкости и координации.',
    whyKidsLoveIt: 'Как игра в догонялки под музыку оркестра.',
    lessons: [
      {
        id: 'qs-walk',
        title: 'Лёгкий бег',
        durationMin: 5,
        summary: 'Шаги квикстепа почти беговые, но колени мягкие и тихие.',
        tip: 'Представь, что пол горячий — стопы не «шлёпают».',
        bpm: 160,
        counts: ['1', '2', '3', '4'],
        steps: [
          {
            count: '1',
            title: 'Шаг',
            instruction: 'Правая вперёд на полупальцах.',
          },
          {
            count: '2',
            title: 'Шаг',
            instruction: 'Левая догоняет лёгким беговым шагом.',
          },
          {
            count: '3–4',
            title: 'Держим темп',
            instruction: 'Продолжай бег по прямой, корпус спокойный.',
          },
        ],
      },
      {
        id: 'qs-chasse',
        title: 'Шассе в сторону',
        durationMin: 7,
        summary: 'Боковое «шаг-вместе-шаг» — главный кирпичик квикстепа.',
        tip: 'На «вместе» стопы почти касаются, но не тормозятся резко.',
        bpm: 176,
        counts: ['1', '2', '3', '4'],
        steps: [
          {
            count: '1',
            title: 'В сторону',
            instruction: 'Правая вправо.',
          },
          {
            count: '2',
            title: 'Вместе',
            instruction: 'Левая подходит к правой.',
          },
          {
            count: '3',
            title: 'Снова в сторону',
            instruction: 'Правая ещё раз вправо.',
          },
          {
            count: '4',
            title: 'Пауза-баланс',
            instruction: 'Зафиксируй вес и готовься в другую сторону.',
          },
        ],
      },
      {
        id: 'qs-lock',
        title: 'Локстеп',
        durationMin: 6,
        summary: 'Скрещивание ног сзади на беге вперёд.',
        tip: 'Скрещивай невысоко — будто завязываешь бантик стопами.',
        bpm: 184,
        counts: ['1', '2', '3', '4'],
        steps: [
          {
            count: '1',
            title: 'Вперёд',
            instruction: 'Правая вперёд.',
          },
          {
            count: '2',
            title: 'Скрест',
            instruction: 'Левая скрещивается сзади правой.',
          },
          {
            count: '3',
            title: 'Вперёд',
            instruction: 'Правая снова вперёд.',
          },
          {
            count: '4',
            title: 'Собрали',
            instruction: 'Левая рядом, корпус смотрит по линии танца.',
          },
        ],
      },
    ],
  },
  {
    id: 'samba',
    name: 'Самба',
    nameEn: 'Samba',
    style: 'latin',
    difficulty: 'medium',
    accent: '#D400FF',
    mood: 'Праздничный и волнистый',
    bpm: 136,
    timeSignature: '2/4',
    description:
      'Бразильский характер: отскок, волны корпусом и радость карнавала.',
    whyKidsLoveIt: 'Можно «пружинить» всем телом и чувствовать праздник.',
    lessons: [
      {
        id: 'samba-bounce',
        title: 'Отскок самбы',
        durationMin: 5,
        summary: 'Главный секрет самбы — непрерывный мягкий bounce вверх-вниз.',
        tip: 'Движение идёт от стоп через колени, бёдра лишь слегка отвечают.',
        bpm: 120,
        counts: ['1', 'a', '2'],
        steps: [
          {
            count: '1',
            title: 'Вниз',
            instruction: 'Слегка согни колени на сильную долю.',
          },
          {
            count: 'a',
            title: 'Вверх',
            instruction: 'Выпрямись на полупальцы между долями.',
          },
          {
            count: '2',
            title: 'Снова вниз',
            instruction: 'Мягко опустись. Bounce не останавливается.',
          },
        ],
      },
      {
        id: 'samba-whisk',
        title: 'Виск',
        durationMin: 7,
        summary: 'Боковой базовый ход самбы с крестом сзади.',
        tip: 'Считай «раз-и-два» — «и» очень короткое.',
        bpm: 128,
        counts: ['1', 'a', '2'],
        steps: [
          {
            count: '1',
            title: 'В сторону',
            instruction: 'Левая влево, bounce вниз.',
          },
          {
            count: 'a',
            title: 'Крест сзади',
            instruction: 'Правая скрещивается сзади на полупальцах.',
          },
          {
            count: '2',
            title: 'Замена',
            instruction: 'Верни вес на левую, правая чуть открывается.',
          },
        ],
      },
      {
        id: 'samba-volta',
        title: 'Вольта',
        durationMin: 6,
        summary: 'Круговое переступание с крестом — готовит к поворотам.',
        tip: 'Смотри туда, куда поворачиваешься — голова помогает корпусу.',
        bpm: 132,
        counts: ['1', 'a', '2', 'a'],
        steps: [
          {
            count: '1',
            title: 'Шаг',
            instruction: 'Правая вперёд по диагонали.',
          },
          {
            count: 'a',
            title: 'Крест',
            instruction: 'Левая скрещивается сзади.',
          },
          {
            count: '2 a',
            title: 'Повтор',
            instruction: 'Снова правая и крест левой, медленно поворачиваясь.',
          },
        ],
      },
    ],
  },
];

export function getDance(id: string): Dance | undefined {
  return dances.find((d) => d.id === id);
}

export function getLesson(
  danceId: string,
  lessonId: string,
): { dance: Dance; lesson: Lesson } | undefined {
  const dance = getDance(danceId);
  if (!dance) return undefined;
  const lesson = dance.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { dance, lesson };
}

export function allLessons(): { dance: Dance; lesson: Lesson }[] {
  return dances.flatMap((dance) =>
    dance.lessons.map((lesson) => ({ dance, lesson })),
  );
}

export function difficultyLabel(d: Difficulty): string {
  switch (d) {
    case 'beginner':
      return 'Старт';
    case 'easy':
      return 'Легко';
    case 'medium':
      return 'Средне';
  }
}

export function styleLabel(s: DanceStyle): string {
  return s === 'standard' ? 'Стандарт' : 'Латина';
}
