import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  SEND_NOTIFICATION_PATTERN,
  TELEGRAM_CLIENT_TOKEN,
  TelegramTask,
} from '@app/common';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    @Inject(TELEGRAM_CLIENT_TOKEN) private readonly telegramClient: ClientProxy,
  ) {}

  async processTaskFromQueue(task: TelegramTask) {
    // Симулируем задержку, чтобы убедиться, что задачи поступают в очередь
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await lastValueFrom(
      this.telegramClient.emit(SEND_NOTIFICATION_PATTERN, task),
      { defaultValue: undefined },
    );
    this.logger.log(`Task ${task.id} dispatched to telegram-service`);
  }
}
