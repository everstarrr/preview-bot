# Preview Bot

Telegram-бот для хранения и выдачи видеопревью по категориям с паролями.

## Стек

- Node.js
- TypeScript
- pnpm
- SQLite (`better-sqlite3`)
- Telegram Bot API через `grammy`

## Функции (MVP)

- `/start`: приветствие + кнопки категорий
- доступ к категории по паролю (хранится как `scrypt`-хеш)
- выдача списка видео в категории (video/video_note + title + description)
- кнопка `⬅ Назад к разделам`
- админ-команды (доступ только по Telegram ID):
  - `/add_category`
  - `/add_video`
  - `/change_password`
  - `/delete_video`
  - `/cancel`

## Архитектура

Проект разделен на слои:

- `src/config` - загрузка и валидация env-конфига
- `src/infrastructure` - инфраструктура БД (инициализация SQLite и миграции)
- `src/repositories` - доступ к данным (`categories`, `videos`, `user_states`)
- `src/services` - бизнес-логика (категории, видео, состояния, доступ админа, навигация)
- `src/controllers` - обработчики Telegram updates (`commands`, `callback_query`, `message`)
- `src/shared` - общие типы и криптография паролей
- `src/app.ts` - композиция зависимостей и регистрация контроллеров
- `src/index.ts` - запуск/остановка приложения

## Установка и запуск

```bash
pnpm install
cp .env.example .env
```

Если `pnpm` попросит approve build scripts, одобрите `better-sqlite3` (и `esbuild`, если будет в списке):

```bash
pnpm approve-builds
```

Заполните `.env`:

- `BOT_TOKEN` - токен бота от BotFather
- `ADMIN_IDS` - Telegram ID администраторов через запятую
- `DB_PATH` - путь к SQLite файлу (по умолчанию `./data/bot.db`)

Разработка:

```bash
pnpm dev
```

Продакшн:

```bash
pnpm build
pnpm start
```

## Хранилище

SQLite таблицы:

- `categories`: категории и пароли
- `videos`: видео (`file_id`) и метаданные
- `user_states`: состояния пошаговых сценариев
