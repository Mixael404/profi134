import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramServiceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramServiceService.name);
  private readonly bot: Telegraf;

  constructor(private readonly config: ConfigService) {
    this.bot = new Telegraf(config.getOrThrow('TG_BOT_TOKEN'));
  }

  onModuleInit() {
    this.bot.command('start', (ctx) =>
      ctx.reply('Bot started! Use /my_id to get your chat ID.'),
    );
    this.bot.command('my_id', (ctx) => ctx.reply(String(ctx.chat.id)));

    this.bot
      .launch()
      .catch((err) => this.logger.error('Bot launch failed', err));

    this.logger.log('Telegram bot launched');
  }

  onModuleDestroy() {
    this.bot.stop('SIGTERM');
  }

  async sendMessage(chatId: string, message: string) {
    await this.bot.telegram.sendMessage(chatId, message);
  }
}
