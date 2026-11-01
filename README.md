# MoreDance

Мобильное приложение для детей: учимся спортивным бальным танцам - стандарт и латина.

## Что внутри

- Каталог из 5 танцев: медленный вальс, ча-ча-ча, джайв, квикстеп, самба
- Пошаговые уроки с подсказками и **видеоуроками**
- Практика под метроном (визуальный счёт + вибрация)
- **Камера**: зеркало + силуэт позы + оценка удержания
- **Аккаунт родителя** с PIN: цель практики, статистика, сброс прогресса
- Прогресс, звёзды и уровни на устройстве

## Запуск (одна команда на всё)

```bash
npm install --legacy-peer-deps
npx expo start
```

Дальше терминал предложит варианты - приложение работает и на Android, и на iPhone,
JS-код у них общий.

### Android

- **Эмулятор**: `powershell -File scripts/start-emulator.ps1`, затем клавиша `a` в терминале Expo.
- **Телефон**: установите Expo Go из Google Play и отсканируйте QR-код из терминала.

### iPhone

- Установите **Expo Go** из App Store. Версия Expo Go и версия проекта должны
  совпадать: проект на **SDK 58**, актуальный Expo Go в App Store - тоже SDK 58.
  Если Expo Go ругается на несовпадение SDK, обновите приложение из App Store.
- Телефон и компьютер - в одной Wi-Fi сети, отсканируйте QR-код камерой iPhone.
- Если сеть другая (гостевой Wi-Fi, мобильный интернет):
  ```bash
  npx expo start --tunnel
  ```
  и отсканируйте новый QR-код.

> Экран с камерой проверяйте только на реальном телефоне: в эмуляторе Android и в
> симуляторе iOS камера отсутствует. Разрешение на камеру запрашивается один раз
> при первом входе в «Позу».

### Сборка установочного приложения

```bash
npx eas build -p android --profile preview   # APK для Android
npx eas build -p ios --profile preview       # сборка для iPhone (нужен Apple ID)
```

Для установки на iPhone вне Expo Go нужен аккаунт Apple Developer (TestFlight или
устройство, добавленное в профиль сборки).

## Готовая сборка для Android (APK)

Собранный APK лежит в разделе **Releases** этого репозитория:

<https://github.com/igorrais82/MoreDance/releases/latest>

1. Откройте ссылку на телефоне Android.
2. В блоке **Assets** скачайте файл `MoreDance-1.0.0.apk`.
3. Разрешите установку из этого источника (телефон спросит один раз) и установите.

APK подписан debug-ключом: для установки на телефон вручную этого достаточно,
но для публикации в Google Play нужен отдельный keystore.

### Сборка своими руками

Надёжнее всего - в облаке: вкладка **Actions** -> workflow **Android APK** ->
**Run workflow**. Через ~20 минут APK будет в артефактах прогона (`MoreDance-apk`).
На Windows локальная сборка упирается в лимит длины путей CMake и требует
включённых длинных путей в реестре.

Локально (Linux/macOS):

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

Файл появится в `android/app/build/outputs/apk/release/`.

## Стек

Expo (React Native) · Expo Router · AsyncStorage · Reanimated · Google Fonts (Bebas Neue, Nunito) ·
expo-video, expo-camera, expo-audio
