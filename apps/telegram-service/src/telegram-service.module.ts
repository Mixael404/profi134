import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramServiceController } from './telegram-service.controller';
import { TelegramServiceService } from './telegram-service.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TelegramServiceController],
  providers: [TelegramServiceService],
})
export class TelegramServiceModule {}
