import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { RmqPublisherService } from './rmq-publisher.service';
import { RetryService } from './retry.service';
import { QUEUE_PUBLISHER } from './queue-publisher.interface';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProducerController],
  providers: [
    ProducerService,
    RetryService,
    RmqPublisherService,
    { provide: QUEUE_PUBLISHER, useExisting: RmqPublisherService },
  ],
})
export class ProducerModule {}
