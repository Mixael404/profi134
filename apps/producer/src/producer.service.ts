import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateNotificationDto,
  NOTIFICATION_EVENT,
  TASKS_QUEUE,
  TelegramTask,
} from '@app/common';
import { IQueuePublisher, QUEUE_PUBLISHER } from './queue-publisher.interface';
import { RetryService } from './retry.service';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(
    @Inject(QUEUE_PUBLISHER) private readonly publisher: IQueuePublisher,
    private readonly retryService: RetryService,
  ) {}

  async createTelegramTask(
    dto: CreateNotificationDto,
  ): Promise<{ success: boolean; taskId: string }> {
    const task: TelegramTask = {
      id: randomUUID(),
      type: 'notification_send',
      payload: { chatId: dto.chatId, message: dto.message },
      createdAt: new Date().toISOString(),
    };

    const publishCb = () => {
      return this.publisher.publish(
        TASKS_QUEUE,
        Buffer.from(
          JSON.stringify({ pattern: NOTIFICATION_EVENT, data: task }),
        ),
        {
          persistent: true,
          messageId: task.id,
          contentType: 'application/json',
        },
      );
    };

    await this.retryService.execute(publishCb, `Task ${task.id}`);

    this.logger.log(`Task ${task.id} confirmed by broker`);
    return { success: true, taskId: task.id };
  }
}
