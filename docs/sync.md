# Синхронизация, авторизация и хранение данных

Подробности, которые нужны при работе с sync, auth, persist и бэкапом.
Краткие правила — в CLAUDE.md.

## Бэкенд (apps/api)

- NestJS 12, ESM ("type": "module", относительные импорты с `.js`). Сборка — tsc
  (без Nest CLI: на Node 22.12 он падает на require(esm)); dev — tsc --watch + node --watch.
- Prisma 7: prisma/schema.prisma, prisma.config.ts (URL БД; DIRECT_URL — для миграций
  в обход пулера Neon), клиент генерируется в src/generated (в .gitignore, postinstall),
  подключение — через драйвер-адаптер @prisma/adapter-pg.
- Локальная БД — compose.yaml в корне, Postgres на порту 5434. Переменные — apps/api/.env
  (шаблон .env.example), валидируются zod в src/config/env.ts (getEnv).
- Все маршруты под /api. Фронт ходит в API на своём origin через прокси (Vite в dev —
  server.proxy на localhost:3000, rewrite Vercel в проде) — поэтому без CORS и с
  SameSite=Strict cookie.
- Валидация входа — ZodValidationPipe со схемами из @gymlog/schemas (не class-validator).
- Ключ синхронизируемых таблиц — (userId, id): id приходят с клиента.

### Auth (src/auth)
- Email + пароль (argon2). Access JWT 15 мин в теле ответа, refresh — случайный токен
  в httpOnly cookie (path /api/auth), в БД — его SHA-256, ротация при каждом /auth/refresh.
- Глобальный AuthGuard: всё закрыто, кроме @Public().

### Sync (src/sync)
- POST /sync/push — записи валидируются по одной (невалидные → rejected, остальные пишутся),
  last-write-wins по клиентскому updatedAt (равный — skip).
- GET /sync/pull?cursor= — изменения после ревизии постранично (SYNC_BATCH_LIMIT, hasMore).
- revision — счётчик на пользователя (User.revision), выдаётся под блокировкой строки
  пользователя (FOR UPDATE); pull читает все таблицы в одном снапшоте (RepeatableRead).

## Фронт: HTTP и сессия

- HTTP-клиент — shared/api/client.ts: apiRequest (на 401 — refresh и повтор), publicRequest,
  ApiError (status 0 — сервер недоступен: это не повод разлогинивать).
- Access-токен — только в памяти модуля. refreshSession — single-flight (в вкладке общий
  промис, между вкладками Web Lock), т.к. сервер ротирует refresh-токен и параллельный
  refresh получил бы 401.
- entities/session: стор (persist только user, без токенов), login/register/logout,
  initSession (в app/App.tsx: слушатели refresh + фоновая проверка сессии).
- Гарды RequireAuth / RequireGuest — app/ui/AuthGuard.tsx. Приложение открывается сразу
  по сохранённому user (в т.ч. офлайн); на /login выкидывает только 401 от refresh.
- Форма входа — features/auth, страница — pages/login. Email, статус синхронизации и выход
  (оставить данные / удалить) — widgets/account.

## Фронт: движок синхронизации

- Стор entities/sync: cursor, synced, rejected, lastSyncedAt; status — не персистится.
- Движок — features/sync/model/syncEngine.ts (startSync в app/App.tsx, requestSync).
- Outbox не хранится, а вычисляется (features/sync/model/pending.ts): запись ждёт отправки,
  если её updatedAt ≠ synced[`<entity>:<id>`] (профиль — ключ `profile`).
- Цикл: push → pull (пока hasMore), single-flight. Триггеры: смена пользователя, правка
  в сторе (debounce 2 с), online, возврат во вкладку, опрос раз в 2 мин, повтор с backoff.
- Записи с сервера — через applyRemote* в сторах entities (mergeRemote / isNewer из
  shared/lib/lww.ts, LWW по updatedAt, updatedAt не трогают). Из pull валидируются по одной
  (restoreItems), битые — в `gymlog-sync-pull:corrupted`.
- После pull — mergeDuplicateExercises: одно упражнение на normalizeName (раньше createdAt,
  затем меньший id), тренировки переписываются на него, остальные — мягко удаляются.
- ensureExercise не плодит id: имя удалённого упражнения восстанавливает его tombstone
  (deletedAt = null, новый updatedAt; из нескольких — удалённый последним), так тренировки
  и история остаются на старом id. Переименование (renameExercise) — обычная правка с LWW.

### Владелец локальных данных
entities/sync userId/userEmail. При входе:
- тот же userId — продолжаем;
- null (данные до входа) или пустое устройство — resetForUser, всё уходит на сервер;
- другой аккаунт с данными — синхронизация стоит, вместо приложения ForeignDataPrompt
  (в RequireAuth): загрузить в этот аккаунт / удалить с устройства / выйти.

## Хранение в localStorage

- Обёртка — shared/lib/storage.ts (loadState, saveState, createPersistStorage, restoreItems,
  pickPersistedField, backupCorrupted).
- createPersistStorage проверяет только конверт { state, version }; zod-валидация — в merge,
  после migrate, по каждой записи отдельно (restoreItems). Невалидное уходит в
  `<key>:corrupted`.
- Миграции — model/migrations.ts каждого стора: *_STATE_VERSION и migrate* (цепочка
  `if (version < N)`).
- Несколько вкладок: persist пишет всё состояние на каждый set, но сам не перечитывает его,
  поэтому вкладка со старым стором затёрла бы чужие правки. syncPersistedStoresAcrossTabs
  (shared/lib/storage.ts, вызывается в app/App.tsx) на событие `storage` делает
  `persist.rehydrate()` нужного стора. Поэтому merge каждого стора должен применять и
  «пустые» значения из хранилища (session: user = null — выход в другой вкладке).
  initSession на смену сессии в другой вкладке сбрасывает access-токен в памяти: иначе
  вкладка ходила бы в API с токеном прежнего аккаунта.

## Резервная копия

- features/data-backup: экспорт/импорт JSON, BackupSchema с BACKUP_VERSION; импорт заменяет
  все данные после подтверждения.
- Импорт побеждает сервер: всем записям из файла ставится updatedAt = now, а записи, которых
  нет в файле, становятся tombstone — так замена доходит до аккаунта и других устройств.

## Черновики форм

- shared/lib/usePersistentDraft.ts: localStorage `gymlog-draft:<key>`, сохранение через
  300 мс и сразу при уходе в фон/pagehide; нетронутый черновик не пишется; clear() после
  сохранения, discard() — «Начать заново».
- Ключи и zod-схемы — features/{workout-form,add-measurement}/model/draftStorage.ts
  (`workout:new`, `workout:<id>`, `measurement:new`).
- Плашка — shared/ui RestoredDraftNotice; при редактировании предупреждает, если тренировка
  изменилась после начала правки (base). Кнопки «Продолжить тренировку / замеры» —
  useHasNewWorkoutDraft / useHasMeasurementDraft.
