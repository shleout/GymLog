# Project: GymLog

Пет-проект: тренировочный дневник для тренажёрного зала. Пользователь
записывает подходы (упражнение, вес, повторения), видит историю тренировок
по дням и прогресс по каждому упражнению.

## Стек
- React 18 + TypeScript (strict mode)
- Vite
- Zustand для глобального состояния + persist в localStorage
- zod для валидации данных (в т.ч. при чтении из localStorage)
- Tailwind CSS v4 для стилей
- date-fns для работы с датами
- react-router v7 для маршрутизации (createBrowserRouter, Link, useNavigate)
- vite-plugin-pwa (Workbox): manifest, service worker, офлайн-запуск
- Node 22 (см. .nvmrc), перед npm-командами — `nvm use`

## Репозиторий (монорепо, npm workspaces)
- apps/web — фронтенд (это приложение). Все пути `src/...` ниже — внутри apps/web.
- apps/api — бэкенд на NestJS (итерация 2, ещё не создан).
- packages/schemas — общие zod-схемы фронта и бэка (появятся вместе с apps/api;
  до этого схемы живут в entities).
- Один package-lock.json и node_modules в корне. Зависимость ставится в
  конкретный workspace: `npm i <pkg> -w @gymlog/web`.
- Деплой фронта — Vercel, Root Directory = apps/web, конфиг apps/web/vercel.json
  (rewrite всех путей на index.html для SPA, immutable-кеш для /assets).
- CI — .github/workflows/ci.yml: npm ci, typecheck, lint, build.
- План вывода в прод и синхронизации — итерации: 1) деплой, схема v1, PWA,
  бэкап; 2) NestJS API (Prisma, Postgres, email+пароль, JWT); 3) синхронизация
  на фронте (local-first: outbox, push/pull, last-write-wins по updatedAt).

## Архитектура: Feature-Sliced Design
- Слои (сверху вниз): app → pages → widgets → features → entities → shared.
- Импорт разрешён только из слоёв СТРОГО НИЖЕ. Импорт внутри одного слоя
  между разными слайсами запрещён.
- app и shared не содержат слайсов, только сегменты (ui, lib, config, api).
- Остальные слои содержат слайсы, каждый слайс обязан иметь index.ts (Public API).
- Импорт из другого слайса — ТОЛЬКО через его index.ts. Глубокие импорты запрещены.
- Сегменты внутри слайса: ui (компоненты), model (типы, zod-схемы, стор), api, lib.
- Импорты между слоями — через алиас `@/` (`@/entities/workout`), внутри
  слайса — относительные пути.

## Доменная модель (тренировочный дневник)
- Exercise: id, name, muscleGroup? (необязательно).
- Set: id, weight? (кг, number, шаг 0.5, необязательно), reps (number), completed (boolean).
- WorkoutEntry: exerciseId, sets: Set[].
- Workout: id, date (ISO string), entries: WorkoutEntry[].
- Правила: weight (если указан) > 0, reps — целое > 0, date не в будущем.
- weight — рабочий или дополнительный вес (блины на поясе при подтягиваниях);
  для упражнений с собственным весом не указывается.
- Упражнения вводятся свободным текстом и сохраняются в справочник
  (ensureExercise). Имена сравниваются без учёта регистра, лишних пробелов
  и ё/е (normalizeName из shared/lib), чтобы не плодить дубли.
- Set пока живёт в entities/workout/model (отдельного слайса entities/set нет).
- Profile: nickname, height? (см, 50–272).
- Measurement (сессия замеров): id, date (ISO, не в будущем), weight? (вес
  тела, кг, 20–400, точность 0.1), values: { name, value (см, точность 0.1) }[].
  Вес тела хранится только в замерах (не в профиле): актуальный вес — из
  последнего замера с весом, так сохраняется история.
- Части тела — свободный ввод, сопоставляются между сессиями по normalizeName.
  Все когда-либо замеренные части подставляются строками в новую форму
  с подсказкой предыдущего значения и даты; пустые строки не сохраняются.

## Данные и синхронизация (схема v1)
- Workout, Measurement, Exercise несут поля синхронизации createdAt, updatedAt,
  deletedAt (ISO, deletedAt — nullable). Profile несёт updatedAt (nullable).
  Схема — SyncMetaSchema в shared/lib/syncMeta.ts.
- id генерируются на клиенте (createId → UUID v4), в том числе офлайн.
- Экшены принимают данные без мета-полей (WorkoutInput, MeasurementInput,
  ProfileInput) и сами ставят createdAt/updatedAt — фичи их не трогают.
- Удаление — только мягкое (deletedAt). Удалённые записи остаются в сторе
  как tombstone для синхронизации. Компоненты читают только активные записи:
  useWorkouts / useMeasurements / useWorkoutById / useMeasurementById /
  selectActive*. Читать state.workouts / state.measurements в UI нельзя.
- persist версионирован: у каждого стора *_STATE_VERSION и migrate* в
  model/migrations.ts (цепочка шагов `if (version < N)`). Любое изменение формы
  данных = +1 к версии + шаг миграции. Без этого данные пользователя пропадут.
- Хранилище (createPersistStorage) проверяет только конверт { state, version };
  zod-валидация — в merge, после migrate, по каждой записи отдельно
  (restoreItems). Невалидное не удаляется, а уходит в `<key>:corrupted`.
- Резервная копия — features/data-backup (экспорт/импорт JSON, BackupSchema
  с BACKUP_VERSION; импорт заменяет все данные после подтверждения).

## Где что лежит
- Роутер — app/router/router.tsx; пути страниц — shared/config/routes.ts
  (ROUTES — шаблоны для роутера, paths — построение ссылок с id).
- Zustand-стор тренировок — entities/workout/model/store.ts.
- Zustand-стор справочника упражнений — entities/exercise/model/store.ts.
- Zustand-сторы профиля и замеров — entities/{profile,measurement}/model/store.ts.
- Последние и предыдущие значения веса и каждой части тела —
  entities/measurement/lib/getLatestMeasurements.ts; значения, предшествующие
  конкретной сессии, — entities/measurement/lib/getPreviousValues.ts.
- Zod-схемы — entities/{workout,exercise,profile,measurement}/model/schemas.ts;
  типы выводятся из схем через z.infer (model/types.ts).
- Хелперы форм — shared/lib: form.ts (parseDecimal, collectErrors, FormErrors),
  dateInput.ts (значения `<input type="date">` ↔ ISO), normalizeName.ts
  (normalizeName, cleanName), formatNumber.ts (числа в формате ru-RU).
- Обёртка localStorage — shared/lib/storage.ts (loadState, saveState,
  createPersistStorage, restoreItems, pickPersistedField, backupCorrupted).
- Генерация id — shared/lib/createId.ts (не crypto.randomUUID напрямую:
  он недоступен по http с телефона; запасной путь — UUID v4 из getRandomValues).
- Общие UI-компоненты — shared/ui (Button, Input, Combobox, ConfirmAction —
  двухшаговое подтверждение удаления, buttonStyles для Link).
- Статистика тренировки (подходы, повторы, объём) — entities/workout/lib/getWorkoutStats.ts.
- Сортировка «новые сверху» — только через sortWorkoutsDesc / sortMeasurementsDesc
  из entities. Даты хранятся с точностью до дня, поэтому при одинаковой дате
  порядок решает createdAt, затем позиция в массиве стора.
- Форма создания и редактирования тренировки — features/workout-form
  (WorkoutForm: без workout — создание, с workout — редактирование).
  ui/ — компоненты, model/ — черновик формы, zod-схема формы
  (переиспользует схемы entities), хук useWorkoutForm.
- Удаление тренировки / сессии замеров (с подтверждением) —
  features/delete-workout, features/delete-measurement.
- Форма никнейма и роста — features/edit-profile.
- Форма новых замеров — features/add-measurement.
- Список тренировок — widgets/workout-list/ui/ (карточки — ссылки на просмотр).
- Просмотр тренировки (readonly) — widgets/workout-details/ui/.
- Нижний таб-бар (Тренировки / Замеры / Профиль) — widgets/nav-bar/ui/. Показывается
  только на верхнеуровневых страницах: они вложены в layout-роут app/ui/TabLayout.tsx.
  Формы и страницы просмотра (с кнопкой «←») живут вне него, без бара.
- Профиль (никнейм, рост, актуальный вес — ссылка на замеры) — widgets/profile-overview/ui/.
- Актуальные значения веса и частей тела с изменением — widgets/latest-measurements/ui/.
- Список сессий замеров (карточки — ссылки на просмотр) — widgets/measurement-list/ui/.
- Просмотр сессии замеров (с изменением к предыдущим значениям) —
  widgets/measurement-details/ui/.
- История по упражнению — widgets/exercise-history/ui/ (ещё не создан).
- Страницы:
  - pages/workout-history — `/`, список тренировок и будущие виджеты прогресса;
  - pages/add-workout — `/workouts/new`;
  - pages/workout-details — `/workouts/:workoutId`, просмотр;
  - pages/edit-workout — `/workouts/:workoutId/edit`, редактирование и удаление;
  - pages/measurements — `/measurements`, актуальные замеры и история сессий;
  - pages/add-measurement — `/measurements/new`;
  - pages/measurement-details — `/measurements/:measurementId`, просмотр и удаление;
  - pages/profile — `/profile`, никнейм, рост, вес, экспорт/импорт данных;
  - pages/edit-profile — `/profile/edit`.

## Правила кода
- Только функциональные компоненты и хуки. Никаких class-компонентов.
- Компоненты — в сегменте ui соответствующего слайса.
- Хуки — в сегменте model или lib слайса, префикс use.
- Глобальное состояние — только через Zustand-сторы в entities/*/model/store.ts.
  useState — только для локального UI-состояния (открыт ли модал, текст в поле,
  черновик формы до сохранения).
- Никаких any. Если тип неизвестен — unknown + проверка через zod.
- Экспорты — именованные, не default.
- Все данные из localStorage проходят через zod-схему при чтении (после
  миграции). Невалидные записи — в `<key>:corrupted` + console.warn, остальные
  сохраняются; молча удалять данные пользователя нельзя.

## Стиль
- Tailwind v4. Конфигурация через @theme в src/app/styles/index.css,
  без tailwind.config.js.
- Без отдельных CSS-файлов и inline-стилей.
- Мобильный-first: интерфейс удобен с телефона в зале.
- Крупные тач-таргеты (мин. 44px), контрастные кнопки.
- Для условных классов использовать cn() из shared/lib/cn.ts (clsx + tailwind-merge).

## Команды (из корня репозитория)
- npm run dev — запуск фронта
- npm run build — сборка фронта (включая sw.js и manifest)
- npm run lint — oxlint во всех workspaces (конфиг apps/web/.oxlintrc.json)
- npm run typecheck — tsc --noEmit во всех workspaces

## Чего не делать
- Не добавлять новые зависимости без явного запроса.
- Не рефакторить файлы, которые я не просил трогать.
- Не менять vite.config.ts и tsconfig.json без необходимости.
- Не нарушать правило импортов FSD.