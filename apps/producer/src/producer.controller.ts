import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNotificationDto } from '@app/common';
import { ProducerService } from './producer.service';

@Controller()
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @MessagePattern('task_create')
  createTelegramTask(@Payload() dto: CreateNotificationDto) {
    console.log('Received task_create message');
    return this.producerService.createTelegramTask(dto);
  }
}
