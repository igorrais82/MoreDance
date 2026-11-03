/**
 * Проверка чистой логики без запуска приложения.
 *
 * Запуск: npm run check  (node scripts/check-logic.mjs)
 * Node 24 сам снимает типы с .ts, поэтому отдельный сборщик не нужен.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ageFromBirthDate,
  categoryForAge,
  formatBirthDateInput,
  rankFor,
  xpFor,
} from '../src/lib/dancer.ts';
import { dayKey, previousDayKey, streakDays } from '../src/lib/day.ts';

test('возраст и категория считаются по дате рождения', () => {
  const now = new Date(2026, 10, 3); // 3 ноября 2026
  assert.equal(ageFromBirthDate('15.06.2010', now), 16);
  assert.equal(categoryForAge(16)?.title, 'Юниоры 2');
  assert.equal(ageFromBirthDate('01.01.2020', now), 6);
  assert.equal(categoryForAge(6)?.title, 'Дети 1');
  assert.equal(ageFromBirthDate('', now), null);
  assert.equal(ageFromBirthDate('не дата', now), null);
});

test('возраст не прибавляется до дня рождения', () => {
  const now = new Date(2026, 10, 3);
  assert.equal(ageFromBirthDate('15.12.2010', now), 15);
  assert.equal(categoryForAge(15)?.title, 'Юниоры 1');
});

test('дата рождения вводится по маске', () => {
  assert.equal(formatBirthDateInput('15062010'), '15.06.2010');
  assert.equal(formatBirthDateInput('15.06.2010'), '15.06.2010');
  assert.equal(formatBirthDateInput('1a5b0'), '15.0');
  assert.equal(formatBirthDateInput(''), '');
});

test('звание растёт по XP и не ломается на границах', () => {
  assert.equal(rankFor(0).title, 'Бронза 1');
  assert.ok(rankFor(0).progress >= 0 && rankFor(0).progress <= 1);
  assert.equal(rankFor(591).title, 'Медь 2');
  assert.match(rankFor(591).hint, /Медь 3/);
  assert.equal(rankFor(10_000_000).isLegend, true);
  assert.match(rankFor(10_000_000).title, /^Легенда \d+$/);
});

test('XP считается из уроков, минут и звёзд', () => {
  assert.equal(xpFor({ lessons: 0, practiceMinutes: 0, stars: 0 }), 0);
  assert.equal(xpFor({ lessons: 2, practiceMinutes: 10, stars: 3 }), 145);
});

test('день практики берётся по локальному календарю', () => {
  assert.equal(dayKey(new Date(2026, 10, 3, 23, 59)), '2026-11-03');
  assert.equal(previousDayKey('2026-03-01'), '2026-02-28');
  assert.equal(previousDayKey('2026-01-01'), '2025-12-31');
});

test('серия дней не обнуляется утром до тренировки', () => {
  const now = new Date(2026, 10, 3);
  const day = { '2026-11-03': 600, '2026-11-02': 300, '2026-11-01': 120 };
  assert.equal(streakDays(day, now), 3);

  // Сегодня ещё не тренировались, но вчерашняя серия жива.
  const yesterdayOnly = { '2026-11-02': 300, '2026-11-01': 120 };
  assert.equal(streakDays(yesterdayOnly, now), 2);

  // Пропущенный день рвёт серию.
  assert.equal(streakDays({ '2026-10-30': 300 }, now), 0);
  assert.equal(streakDays({}, now), 0);
});
