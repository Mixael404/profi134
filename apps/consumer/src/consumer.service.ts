import { TelegramTask } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';

const PROCESSING_DELAY_MS = 3000;

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);

  async processTaskFromQueue(task: TelegramTask) {
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
    this.logger.log('Task is completed 222');
  }
}
