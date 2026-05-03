import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TELEGRAM_CLIENT_TOKEN } from '@app/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TELEGRAM_CLIENT_TOKEN,
        transport: Transport.TCP,
        options: {
          host: process.env.TELEGRAM_SERVICE_HOST ?? 'telegram-service',
          port: Number(process.env.TELEGRAM_SERVICE_PORT) || 3002,
        },
      },
    ]),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
})
export class ConsumerModule {}
