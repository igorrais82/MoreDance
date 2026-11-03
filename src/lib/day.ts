/** Календарные ключи для дневной практики и серии дней. */

/** Локальная дата в виде «2026-11-03» (не UTC: цель «за сегодня» должна совпадать с календарём ребёнка). */
export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Ключ предыдущего дня: считается через Date, чтобы не ломаться на переходе месяца. */
export function previousDayKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return key;
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return dayKey(date);
}

/**
 * Серия дней подряд с практикой.
 *
 * Если сегодня ещё не тренировались, серия не обнуляется до конца дня -
 * считаем от вчерашнего дня. Так ребёнок видит «4 дня подряд» утром, а не «0».
 */
export function streakDays(
  practiceByDay: Record<string, number>,
  today = new Date(),
): number {
  const todayKey = dayKey(today);
  let cursor = practiceByDay[todayKey] ? todayKey : previousDayKey(todayKey);
  let streak = 0;
  while ((practiceByDay[cursor] ?? 0) > 0) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }
  return streak;
}
