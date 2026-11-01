/**
 * «Выступления и разное» - ролики с концертов, мероприятий и наших танцоров.
 * Под-вкладка внутри «Сцены».
 *
 * Как добавить ролик:
 * 1. Положить mp4 в `assets/videos/performances/` (H.264), при желании кадр-превью.
 * 2. Добавить объект в массив `performances` (пример ниже).
 */

export type PerformanceVideo = {
  id: string;
  title: string;
  /** Где и когда: «Отчётный концерт, май 2026». */
  place?: string;
  description?: string;
  /** Локальный mp4: require('../../assets/videos/performances/show-01.mp4'). */
  video: number;
  poster?: number;
};

export const performances: PerformanceVideo[] = [
  // Пример будущей записи:
  // {
  //   id: 'show-01',
  //   title: 'Отчётный концерт: вальс',
  //   place: 'ДК, май 2026',
  //   description: 'Наша пара на отчётном концерте.',
  //   video: require('../../assets/videos/performances/show-01.mp4'),
  // },
];

export function getPerformance(id: string | undefined): PerformanceVideo | undefined {
  if (!id) return undefined;
  return performances.find((item) => item.id === id);
}
