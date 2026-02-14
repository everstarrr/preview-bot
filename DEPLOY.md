# Deploy Guide

Инструкция для деплоя бота на Ubuntu сервер с автозапуском через `systemd`.

## 1. Подготовка сервера

```bash
sudo apt update
sudo apt install -y git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
corepack enable
corepack prepare pnpm@10.29.1 --activate
```

Проверка:

```bash
node -v
pnpm -v
```

## 2. Клонирование проекта

```bash
sudo mkdir -p /opt/preview-bot
sudo chown $USER:$USER /opt/preview-bot
git clone <YOUR_REPO_URL> /opt/preview-bot
cd /opt/preview-bot
```

## 3. Конфигурация

```bash
cp .env.example .env
```

Заполните `.env`:

- `BOT_TOKEN=...`
- `ADMIN_IDS=123456789,987654321`
- `DB_PATH=./data/bot.db`

## 4. Установка и сборка

```bash
pnpm install
pnpm approve-builds
pnpm build
```

В `pnpm approve-builds` одобрите `better-sqlite3` (и `esbuild`, если есть).

## 5. Запуск через systemd

Создайте сервис:

```bash
sudo nano /etc/systemd/system/preview-bot.service
```

Содержимое:

```ini
[Unit]
Description=Preview Telegram Bot
After=network.target

[Service]
Type=simple
User=<DEPLOY_USER>
WorkingDirectory=/opt/preview-bot
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/preview-bot/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Замените `<DEPLOY_USER>` на пользователя сервера (например, `ubuntu`).

Запуск:

```bash
sudo systemctl daemon-reload
sudo systemctl enable preview-bot.service
sudo systemctl start preview-bot.service
sudo systemctl status preview-bot.service
```

Логи:

```bash
journalctl -u preview-bot.service -f
```

## 6. Обновление бота

```bash
cd /opt/preview-bot
git pull
pnpm install
pnpm build
sudo systemctl restart preview-bot.service
```

## 7. Бэкап SQLite

```bash
cp /opt/preview-bot/data/bot.db /opt/preview-bot/data/bot.db.backup.$(date +%F-%H%M)
```
