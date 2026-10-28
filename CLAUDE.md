# Project: GymLog

Пет-проект: тренировочный дневник для тренажёрного зала. Пользователь
записывает подходы (упражнение, вес, повторения), видит историю тренировок
по дням, прогресс по упражнениям и замеры тела. Local-first PWA с синхронизацией.

Подробности синхронизации, auth, бэкенда, persist, бэкапа и черновиков —
**docs/sync.md**. Читать перед работой с этими темами.

## Стек
- React 18 + TypeScript (strict), Vite, Tailwind CSS v4, react-router v7
  (createBrowserRouter, Link, useNavigate), date-fns.
- Zustand + persist в localStorage, zod для валидации (в т.ч. при чтении из localStorage).
- vite-plugin-pwa (Workbox): manifest, service worker, офлайн-запуск.
- Бэкенд — NestJS 12 + Prisma 7 + Postgres (apps/api).
- Node 22 (.nvmrc), перед npm-командами — `nvm use`.

## Репозиторий (монорепо, npm workspaces)
- apps/web — фронтенд. Все пути `src/...` ниже — внутри apps/web.
- apps/api — бэкенд (ESM, импорты с `.js`, сборка tsc без Nest CLI). Все маршруты под /api,
  фронт ходит через прокси на своём origin (без CORS). Валидация — ZodValidationPipe.
- packages/schemas (@gymlog/schemas) — общие zod-схемы записей и контракты API. Собирается
  tsc в dist — при правке схем держать запущенным `npm run dev:schemas`.
  entities/*/model/schemas.ts реэкспортируют схемы отсюда; *StateSchema — только во фронте.
- Один package-lock.json в корне. Зависимость — в конкретный workspace:
  `npm i <pkg> -w @gymlog/web`.
- Деплой: фронт — Vercel (Root Directory = apps/web, apps/web/vercel.json), API — Render
  (render.yaml), БД — Neon. CI — .github/workflows/ci.yml (typecheck, lint, build).
- Версия приложения — `version` в apps/web/package.json (единственный источник), APP_VERSION
  в shared/config/version.ts, подпись внизу страницы профиля. После смены версии —
  `npm install --package-lock-only --ignore-scripts`.

## Архитектура фронта: Feature-Sliced Design
- Слои (сверху вниз): app → pages → widgets → features → entities → shared.
- Импорт разрешён только из слоёв СТРОГО НИЖЕ. Импорт между слайсами одного слоя запрещён.
- app и shared — без слайсов, только сегменты (ui, lib, config, api).
- Каждый слайс имеет index.ts (Public API); из другого слайса — только через него.
- Сегменты слайса: ui (компоненты), model (типы, zod-схемы, стор), api, lib.
- Между слоями — алиас `@/` (`@/entities/workout`), внутри слайса — относительные пути.

## Доменная модель
- Exercise: id, name, muscleGroup?.
- Set: id, weight? (кг, шаг 0.5), reps, completed, rir? (повторы в запасе, целое 0–10).
  Живёт в entities/workout/model.
- WorkoutEntry: exerciseId, sets: Set[], note?. Workout: id, date (ISO), entries, note?.
  Заметки — trim, 1–1000 символов, пустая = нет поля. Заметка тренировки — колонка в БД,
  заметка упражнения и rir — внутри JSON entries. В подсказке формы — последняя заметка
  по упражнению (даже из давней тренировки).
- Правила: weight (если указан) > 0, reps — целое > 0, date не в будущем.
- weight — рабочий или дополнительный вес; для упражнений с собственным весом не указывается.
- Упражнения вводятся свободным текстом и сохраняются в справочник (ensureExercise).
  Имена сравниваются через normalizeName (регистр, пробелы, ё/е), чтобы не плодить дубли.
- Profile: nickname, height? (см, 50–272).
- Measurement (сессия замеров): id, date (ISO, не в будущем), weight? (вес тела, кг, 20–400,
  точность 0.1), values: { name, value (см, точность 0.1) }[].
- Вес тела — только в замерах, не в профиле: актуальный вес — из последнего замера с весом.
- Части тела — свободный ввод, сопоставляются по normalizeName. Все ранее замеренные части
  подставляются в новую форму с подсказкой прошлого значения; пустые строки не сохраняются.

## Данные и синхронизация — ключевые правила
- Workout, Measurement, Exercise несут createdAt, updatedAt, deletedAt (nullable);
  Profile — updatedAt (nullable). SyncMetaSchema / createSyncMeta — shared/lib/syncMeta.ts.
- id генерируются на клиенте — только через shared/lib/createId.ts (crypto.randomUUID
  недоступен по http с телефона).
- Экшены принимают данные без мета-полей (WorkoutInput и т.п.) и сами ставят
  createdAt/updatedAt — фичи их не трогают.
- Удаление — только мягкое (deletedAt), tombstone остаются в сторе для синхронизации.
  UI читает только активные записи: useWorkouts / useMeasurements / useWorkoutById /
  useMeasurementById / selectActive*. Читать state.workouts / state.measurements в UI нельзя.
- Записи с сервера — только через applyRemote* в сторах (LWW по updatedAt).
- persist версионирован: любое изменение формы данных = +1 к *_STATE_VERSION + шаг в
  model/migrations.ts. Без этого данные пользователя пропадут.
- Сортировка «новые сверху» — только sortWorkoutsDesc / sortMeasurementsDesc (дата с
  точностью до дня, дальше решает createdAt, затем позиция в сторе).

## Неочевидные места
- Роутер — app/router/router.tsx; пути — shared/config/routes.ts (ROUTES — шаблоны,
  paths — ссылки с id).
- Хелперы форм — shared/lib: form.ts (parseDecimal, collectErrors, FormErrors),
  dateInput.ts (`<input type="date">` ↔ ISO), normalizeName.ts, formatNumber.ts (ru-RU).
- Общие UI — shared/ui (Button, Input, PasswordInput — с «глазиком», Combobox, ConfirmAction — двухшаговое удаление,
  buttonStyles для Link, RestoredDraftNotice, Chip, SegmentedControl, LineChart).
- Форма тренировки — features/workout-form (WorkoutForm: без workout — создание,
  с workout — редактирование).
- Последние/предыдущие значения замеров — entities/measurement/lib/getLatestMeasurements.ts
  и getPreviousValues.ts; ряды по частям тела для графика — getMeasurementTracks.ts (виджет
  widgets/measurement-chart, «История» на /measurements: График | Список). Статистика тренировки — entities/workout/lib/getWorkoutStats.ts.
- Нижний таб-бар (widgets/nav-bar) — только на верхнеуровневых страницах, вложенных в
  layout-роут app/ui/TabLayout.tsx. Формы и страницы просмотра (с «←») — вне него.
- Вход обязателен (гарды в app/ui/AuthGuard.tsx), единственная публичная страница — /login.
- Справочник упражнений — pages/exercises (/exercises, четвёртый таб): добавление и список-навигация.
  Страница упражнения — pages/exercise-details (/exercises/:id, меню «⋯» — переименование,
  удаление) + widgets/exercise-history (сводка, График | Рекорды | История). Проверка имени —
  entities/exercise/lib/validateExerciseName.ts.
- Прогресс считается из тренировок, без хранимых полей — entities/workout/lib: getExerciseSessions,
  getBestSet (лучший подход — по 1ПМ Эпли, подход на 1 повтор = сам вес; без веса — max reps),
  getExerciseProgress (точки + подходы «на раз» — строго reps === 1), getRepRecords (подходы, не
  побитые ни по весу, ни по повторам), getRepRecord (лучший вес на ≥ N повторов), getMaxRepsRecords
  (без веса — рекорды повторов за подход), getRecentChange (лучшее за 3 мес vs раньше). Подсказка
  «В прошлый раз / Рекорд на N» в форме — features/workout-form/model/useExerciseHint.ts.
- График — свой SVG в shared/ui/LineChart.tsx (ось X по реальным датам), без библиотек.

## Правила кода
- Только функциональные компоненты и хуки. Компоненты — в сегменте ui слайса.
- Хуки — в model или lib слайса, префикс use.
- Глобальное состояние — только Zustand-сторы в entities/*/model/store.ts. useState — только
  для локального UI-состояния (модал, текст в поле, черновик формы).
- Никаких any: неизвестное — unknown + проверка через zod.
- Только именованные экспорты.
- Данные из localStorage проходят zod-схему после миграции. Невалидные записи — в
  `<key>:corrupted` + console.warn, остальные сохраняются; молча удалять данные нельзя.

## Стиль
- Tailwind v4, конфигурация через @theme в src/app/styles/index.css, без tailwind.config.js.
- Без отдельных CSS-файлов и inline-стилей. Условные классы — cn() из shared/lib/cn.ts.
- Тема тёмная (фиолетовая база, зелёный primary, фиолетовый accent). Цвета — только токены
  из @theme (bg-surface-raised, а не bg-white). Шрифты — @fontsource-variable (Manrope —
  font-sans, Unbounded — font-display для h1/h2), в precache — только latin и cyrillic.
- Цвет PWA (theme_color в vite.config.ts и meta theme-color) = --color-surface. Иконки:
  icon.svg + PNG в public/ — при смене цвета перегенерировать PNG.
- Мобильный-first: удобно с телефона в зале. Тач-таргеты мин. 44px, контрастные кнопки.

## Команды (из корня)
- npm run dev — фронт; npm run dev:api — API (нужны db:up и apps/api/.env)
- npm run db:up / db:down — локальный Postgres в Docker (порт 5434)
- npm run db:migrate -w @gymlog/api — миграция после правки schema.prisma
- npm run build / lint / typecheck — по всем workspaces

## Чего не делать
- Не добавлять новые зависимости без явного запроса.
- Не рефакторить файлы, которые я не просил трогать.
- Не менять vite.config.ts и tsconfig.json без необходимости.
- Не нарушать правило импортов FSD.
