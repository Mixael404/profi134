import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NOTIFICATION_EVENT, TelegramTask } from '@app/common';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(NOTIFICATION_EVENT)
  async handleNotificationSend(@Payload() task: TelegramTask) {
    return this.consumerService.processTaskFromQueue(task);
  }
}
