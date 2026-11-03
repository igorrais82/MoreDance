/** Русская форма слова для числа: 1 звезда, 2 звезды, 5 звёзд. */
export function plural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(Math.trunc(count));
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = abs % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** «1 звезда», «23 звезды» — для подписей вида «23 звёзды». */
export function withPlural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  return `${count} ${plural(count, one, few, many)}`;
}
