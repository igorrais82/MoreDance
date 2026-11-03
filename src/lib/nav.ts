import type { Href } from 'expo-router';

/** Минимум, который нужен от роутера для безопасного возврата. */
type BackRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

/**
 * Возврат на предыдущий экран.
 *
 * Если экран открыт по прямой ссылке (из уведомления, диплинка или после
 * перезапуска), истории нет и `router.back()` падает с ошибкой «GO_BACK не
 * обработан». В этом случае уводим на главный экран.
 */
export function goBack(router: BackRouter, fallback: Href = '/') {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
