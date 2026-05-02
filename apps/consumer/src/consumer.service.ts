import { TelegramTask } from '@app/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerService {
  async processTaskFromQueue(task: TelegramTask) {
    console.log(task);
  }
}
