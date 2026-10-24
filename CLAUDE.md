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
- Node 22 (см. .nvmrc), перед npm-командами — `nvm use`

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
  createZodStorage — адаптер для zustand persist).
- Генерация id — shared/lib/createId.ts (не crypto.randomUUID напрямую:
  он недоступен по http с телефона).
- Общие UI-компоненты — shared/ui (Button, Input, Combobox, ConfirmAction —
  двухшаговое подтверждение удаления, buttonStyles для Link).
- Статистика тренировки (подходы, повторы, объём) — entities/workout/lib/getWorkoutStats.ts.
- Сортировка «новые сверху» — только через sortWorkoutsDesc / sortMeasurementsDesc
  из entities. Даты хранятся с точностью до дня, поэтому при одинаковой дате
  новее та запись, что введена позже (позже в массиве стора).
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
- Профиль (никнейм, рост, вес, последние замеры с изменением) — widgets/profile-overview/ui/.
- Список сессий замеров (карточки — ссылки на просмотр) — widgets/measurement-list/ui/.
- Просмотр сессии замеров (с изменением к предыдущим значениям) —
  widgets/measurement-details/ui/.
- История по упражнению — widgets/exercise-history/ui/ (ещё не создан).
- Страницы:
  - pages/workout-history — `/`, список тренировок и будущие виджеты прогресса;
  - pages/add-workout — `/workouts/new`;
  - pages/workout-details — `/workouts/:workoutId`, просмотр;
  - pages/edit-workout — `/workouts/:workoutId/edit`, редактирование и удаление;
  - pages/profile — `/profile`, актуальные замеры и история сессий замеров;
  - pages/edit-profile — `/profile/edit`;
  - pages/add-measurement — `/profile/measurements/new`;
  - pages/measurement-details — `/profile/measurements/:measurementId`,
    просмотр и удаление.

## Правила кода
- Только функциональные компоненты и хуки. Никаких class-компонентов.
- Компоненты — в сегменте ui соответствующего слайса.
- Хуки — в сегменте model или lib слайса, префикс use.
- Глобальное состояние — только через Zustand-сторы в entities/*/model/store.ts.
  useState — только для локального UI-состояния (открыт ли модал, текст в поле,
  черновик формы до сохранения).
- Никаких any. Если тип неизвестен — unknown + проверка через zod.
- Экспорты — именованные, не default.
- Все данные из localStorage проходят через zod-схему при чтении.
  Если данные невалидны — сбросить к дефолту и залогировать.

## Стиль
- Tailwind v4. Конфигурация через @theme в src/app/styles/index.css,
  без tailwind.config.js.
- Без отдельных CSS-файлов и inline-стилей.
- Мобильный-first: интерфейс удобен с телефона в зале.
- Крупные тач-таргеты (мин. 44px), контрастные кнопки.
- Для условных классов использовать cn() из shared/lib/cn.ts (clsx + tailwind-merge).

## Команды
- npm run dev — запуск
- npm run build — сборка
- npm run lint — oxlint (конфиг .oxlintrc.json)
- npm run typecheck — tsc --noEmit -p tsconfig.app.json

## Чего не делать
- Не добавлять новые зависимости без явного запроса.
- Не рефакторить файлы, которые я не просил трогать.
- Не менять vite.config.ts и tsconfig.json без необходимости.
- Не нарушать правило импортов FSD.