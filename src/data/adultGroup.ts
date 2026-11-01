/**
 * «Взрослая группа» - видео, где танцуют взрослые на наших бальных танцах.
 * Это не бальные танцы, поэтому раздел живёт отдельно от детского каталога.
 *
 * Как добавить ролик:
 * 1. Положить файл в `assets/videos/adult/` (например `hiphop-01.mp4`, H.264).
 *    При желании - превью `assets/videos/adult/hiphop-01.jpg`.
 * 2. Добавить объект в `adultVideos` ниже (см. пример в комментарии).
 * Порядок в массиве = порядок карточек на экране.
 */

export type AdultVideo = {
  /** Латинский id для адреса /adult/<id>. */
  id: string;
  /** Название ролика, показывается на карточке. */
  title: string;
  /** Направление танца: «Хип-хоп», «Сальса», «Народный» и т. п. */
  style: string;
  /** Кто танцует: группа, тренер, событие. Необязательно. */
  dancers?: string;
  /** Пара предложений о ролике. Необязательно. */
  description?: string;
  /** Локальный mp4: require('../../assets/videos/adult/hiphop-01.mp4'). */
  video: number;
  /** Превью для карточки: require('../../assets/videos/adult/hiphop-01.jpg'). */
  poster?: number;
};

/**
 * Пока пусто - на экране показывается заглушка «Видео скоро появятся».
 * Пример будущей записи:
 *
 *   {
 *     id: 'hiphop-01',
 *     title: 'Хип-хоп: связка',
 *     style: 'Хип-хоп',
 *     dancers: 'Взрослая группа, тренер Аня',
 *     description: 'Разминка и короткая связка под музыку.',
 *     video: require('../../assets/videos/adult/hiphop-01.mp4'),
 *   },
 */
export const adultVideos: AdultVideo[] = [];

export function getAdultVideo(id: string | undefined): AdultVideo | undefined {
  if (!id) return undefined;
  return adultVideos.find((item) => item.id === id);
}
