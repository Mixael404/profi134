# Telegram Notification Service

## Требования

- Docker
- Docker Compose

## Переменные окружения

Создать файл `.env` в корне проекта:

```env
PORT=3000

RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_QUEUE=tasks_queue

TG_BOT_TOKEN=8662869125:AAG0RWTfc87N97rJmtUznqQngFB1wY4-WdU
```

## Запуск

```sh
./start.sh
```

## Ссылка на бота
[t.me/profi134tz_bot](https://t.me/profi134tz_bot)

## API

## Получить свой chat ID

Написать боту команду `/my_id`.

**POST** `http://localhost:3000/notifications`

```json
{
  "chatId": "123456789",
  "message": "Текст сообщения"
}
```

Swagger: `http://localhost:3000/docs`
