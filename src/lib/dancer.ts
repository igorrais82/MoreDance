/** Возрастные категории и ранги танцора. */

export type Category = {
  key: string;
  title: string;
  /** Полных лет от и до (включительно). */
  from: number;
  to: number;
};

/** Категории как в спортивных бальных танцах (WDSF-подобная сетка). */
export const CATEGORIES: Category[] = [
  { key: 'kids1', title: 'Дети 1', from: 0, to: 6 },
  { key: 'kids2', title: 'Дети 2', from: 7, to: 9 },
  { key: 'juvenile1', title: 'Ювеналы 1', from: 10, to: 11 },
  { key: 'juvenile2', title: 'Ювеналы 2', from: 12, to: 13 },
  { key: 'junior1', title: 'Юниоры 1', from: 14, to: 15 },
  { key: 'junior2', title: 'Юниоры 2', from: 16, to: 17 },
  { key: 'youth', title: 'Молодёжь', from: 18, to: 20 },
  { key: 'adult', title: 'Взрослые', from: 21, to: 120 },
];

/**
 * Ранги: металлы от бронзы к алмазу, по три ступени в каждом,
 * дальше «Легенда» без верхней границы. Цвет - от тусклого к самому яркому.
 */
export const RANK_TIERS: { name: string; color: string }[] = [
  { name: 'Бронза', color: '#B06A3B' },
  { name: 'Медь', color: '#E89A5A' },
  { name: 'Серебро', color: '#C9D4E0' },
  { name: 'Золото', color: '#FFD84A' },
  { name: 'Платина', color: '#9BE8E0' },
  { name: 'Алмаз', color: '#7FC8FF' },
];

/** Цена одной ступени внутри ранга. */
export const RANK_STEP = 140;

export const LEGEND_COLOR = '#FF6BD6';

export type RankTitle = { title: string; xp: number; color: string };

export const RANKS: RankTitle[] = RANK_TIERS.flatMap((tier, tierIndex) =>
  [1, 2, 3].map((level) => ({
    title: `${tier.name} ${level}`,
    xp: (tierIndex * 3 + level - 1) * RANK_STEP,
    color: tier.color,
  })),
);

/** С какого XP начинается «Легенда 1». */
export const LEGEND_START_XP = RANKS.length * RANK_STEP;
RANKS.push({ title: 'Легенда 1', xp: LEGEND_START_XP, color: LEGEND_COLOR });

export function ageFromBirthDate(birthDate: string | null, now = new Date()): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map((part) => Number(part));
  if (!day || !month || !year) return null;

  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return null;

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 && age < 130 ? age : null;
}

export function categoryForAge(age: number | null): Category | null {
  if (age === null) return null;
  return CATEGORIES.find((item) => age >= item.from && age <= item.to) ?? null;
}

/** XP: уроки + минуты практики + звёзды. */
export function xpFor(stats: {
  lessons: number;
  practiceMinutes: number;
  stars: number;
}): number {
  return stats.lessons * 40 + stats.practiceMinutes * 2 + stats.stars * 15;
}

export function rankFor(xp: number) {
  if (xp >= LEGEND_START_XP) {
    const level = 1 + Math.floor((xp - LEGEND_START_XP) / RANK_STEP);
    const floorXp = LEGEND_START_XP + (level - 1) * RANK_STEP;
    return {
      index: RANKS.length - 1 + level - 1,
      title: `Легенда ${level}`,
      color: LEGEND_COLOR,
      next: `Легенда ${level + 1}`,
      toNext: Math.max(0, floorXp + RANK_STEP - xp),
      progress: Math.min(1, (xp - floorXp) / RANK_STEP),
      isLegend: true,
    };
  }

  let index = 0;
  for (let i = 0; i < RANKS.length; i += 1) {
    if (xp >= RANKS[i].xp) index = i;
  }
  const current = RANKS[index];
  const next = RANKS[index + 1] ?? null;
  const span = next ? next.xp - current.xp : 1;
  const done = next ? xp - current.xp : 1;

  return {
    index,
    title: current.title,
    color: current.color,
    next: next?.title ?? null,
    toNext: next ? Math.max(0, next.xp - xp) : 0,
    progress: next ? Math.min(1, done / span) : 1,
    isLegend: false,
  };
}

export function formatBirthDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(
    (part) => part.length > 0,
  );
  return parts.join('.');
}
