import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NOTIFICATION_EVENT, TelegramTask } from '@app/common';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(NOTIFICATION_EVENT)
  async handleNotificationSend(
    @Payload() task: TelegramTask,
    @Ctx() context: RmqContext,
  ) {
    await this.consumerService.processTaskFromQueue(task);
    context.getChannelRef().ack(context.getMessage());
  }
}
