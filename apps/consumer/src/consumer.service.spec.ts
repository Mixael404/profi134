import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { ConsumerService } from './consumer.service';
import {
  SEND_NOTIFICATION_PATTERN,
  TELEGRAM_CLIENT_TOKEN,
  TelegramTask,
} from '@app/common';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let telegramClient: { emit: jest.Mock };

  const mockTask: TelegramTask = {
    id: 'task-abc',
    type: 'notification_send',
    payload: { chatId: '99', message: 'world' },
    createdAt: '2024-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    telegramClient = { emit: jest.fn().mockReturnValue(of(undefined)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        { provide: TELEGRAM_CLIENT_TOKEN, useValue: telegramClient },
      ],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
  });

  it('should emit task to telegram-service with correct pattern', async () => {
    await service.processTaskFromQueue(mockTask);

    expect(telegramClient.emit).toHaveBeenCalledWith(
      SEND_NOTIFICATION_PATTERN,
      mockTask,
    );
  });

  it('should complete without error on successful emit', async () => {
    await expect(service.processTaskFromQueue(mockTask)).resolves.not.toThrow();
  });

  it('should propagate error when emit fails', async () => {
    telegramClient.emit.mockReturnValue(
      throwError(() => new Error('tcp error')),
    );

    await expect(service.processTaskFromQueue(mockTask)).rejects.toThrow(
      'tcp error',
    );
  });
});
