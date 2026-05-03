import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TelegramServiceModule } from './telegram-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TelegramServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.TELEGRAM_SERVICE_PORT) || 3002,
      },
    },
  );
  await app.listen();
}
bootstrap();
