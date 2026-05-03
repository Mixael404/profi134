import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NOTIFICATION_EVENT, TelegramTask } from '@app/common';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(NOTIFICATION_EVENT)
  async handleNotificationSend(
    @Payload() task: TelegramTask,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.consumerService.processTaskFromQueue(task);
      channel.ack(message);
    } catch (err) {
      const redelivered = message.fields.redelivered;
      this.logger.error(
        `Task ${task.id} failed (redelivered=${redelivered}): ${err instanceof Error ? err.message : err}`,
      );
      // requeue=false on second attempt to avoid infinite loop
      channel.nack(message, false, !redelivered);
    }
  }
}
