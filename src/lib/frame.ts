import { colors } from '../theme';

export type FrameRating = {
  /** Короткая оценка: «Мало», «Хорошо», «Отлично»… */
  label: string;
  /** Что именно означает это время и что тренировать дальше. */
  hint: string;
  accent: string;
};

/** Порог, с которого удержание рамы считается зачётным результатом. */
export const FRAME_GOOD_SECONDS = 30;

/** Оценка удержания рамы по секундам. */
export function frameRating(seconds: number): FrameRating {
  if (seconds < 10) {
    return {
      label: 'Мало',
      hint: 'Рама почти не держится: руки опускаются сразу. Начни с 15 секунд и следи, чтобы плечи не лезли вверх.',
      accent: colors.muted,
    };
  }
  if (seconds < 30) {
    return {
      label: 'Не очень',
      hint: 'Начало положено, но рама ещё «плывёт» - обычно провисают локти. Держи предплечья параллельно полу.',
      accent: colors.coral,
    };
  }
  if (seconds < 60) {
    return {
      label: 'Неплохо',
      hint: 'Полминуты - это уже рабочая рама. Добавь ещё немного, не поднимая плечи и не задерживая дыхание.',
      accent: colors.gold,
    };
  }
  if (seconds < 120) {
    return {
      label: 'Хорошо',
      hint: 'Минута без провисания - крепкая рама. Проверь, не заваливается ли корпус назад: вес должен быть на всей стопе.',
      accent: colors.sky,
    };
  }
  if (seconds < 180) {
    return {
      label: 'Отлично',
      hint: 'Две минуты и больше - рама держится сама, без лишнего напряжения в плечах. Так держать!',
      accent: colors.mint,
    };
  }
  return {
    label: 'Блестяще',
    hint: 'Три минуты и больше - уровень, с которым можно выходить в пару. Мышцы запомнили раму как привычку.',
    accent: colors.mint,
  };
}

/** 75 → «1:15», 8 → «0:08». */
export function formatHold(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
