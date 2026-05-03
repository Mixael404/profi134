import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SEND_NOTIFICATION_PATTERN, TelegramTask } from '@app/common';
import { TelegramServiceService } from './telegram-service.service';

@Controller()
export class TelegramServiceController {
  constructor(private readonly telegramService: TelegramServiceService) {}

  @EventPattern(SEND_NOTIFICATION_PATTERN)
  async handleSendNotification(@Payload() task: TelegramTask) {
    await this.telegramService.sendMessage(
      task.payload.chatId,
      task.payload.message,
    );
  }
}
