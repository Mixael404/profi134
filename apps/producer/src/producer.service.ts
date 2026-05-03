import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import {
  CreateNotificationDto,
  NOTIFICATION_EVENT,
  RABBITMQ_CLIENT_TOKEN,
  TelegramTask,
} from '@app/common';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);
  private readonly processedIds = new Set<string>();

  constructor(
    @Inject(RABBITMQ_CLIENT_TOKEN)
    private readonly rabbitClient: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.rabbitClient.connect();
  }

  async createTelegramTask(
    dto: CreateNotificationDto,
  ): Promise<{ success: boolean; taskId: string }> {
    const task: TelegramTask = {
      id: randomUUID(),
      type: 'notification_send',
      payload: { chatId: dto.chatId, message: dto.message },
      createdAt: new Date().toISOString(),
    };

    if (this.processedIds.has(task.id)) {
      this.logger.warn(`Duplicate task ${task.id} rejected`);
      return { success: false, taskId: task.id };
    }

    await firstValueFrom(this.rabbitClient.emit(NOTIFICATION_EVENT, task));
    this.processedIds.add(task.id);

    return { success: true, taskId: task.id };
  }
}
