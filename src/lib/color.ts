/** Небольшие помощники для работы с hex-цветами. */

function clamp(value: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const num = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(num)) return [20, 8, 42];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (value: number) => clamp(value).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** Смешивает два цвета: t=0 даёт a, t=1 даёт b. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/** Полупрозрачный вариант цвета. */
export function withAlpha(hex: string, alpha: number): string {
  const a = clamp(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`.toUpperCase();
}
