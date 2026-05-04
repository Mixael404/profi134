import { Test, TestingModule } from '@nestjs/testing';
import { TelegramServiceController } from './telegram-service.controller';
import { TelegramServiceService } from './telegram-service.service';
import { TelegramTask } from '@app/common';

describe('TelegramServiceController', () => {
  let controller: TelegramServiceController;
  let service: jest.Mocked<TelegramServiceService>;

  const mockTask: TelegramTask = {
    id: 'task-xyz',
    type: 'notification_send',
    payload: { chatId: '777', message: 'Hello from test!' },
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramServiceController],
      providers: [
        {
          provide: TelegramServiceService,
          useValue: { sendMessage: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    controller = module.get<TelegramServiceController>(TelegramServiceController);
    service = module.get(TelegramServiceService);
  });

  it('should call sendMessage with chatId and message from payload', async () => {
    await controller.handleSendNotification(mockTask);

    expect(service.sendMessage).toHaveBeenCalledWith(
      mockTask.payload.chatId,
      mockTask.payload.message,
    );
  });

  it('should propagate error if sendMessage throws', async () => {
    service.sendMessage.mockRejectedValue(new Error('Telegram error'));

    await expect(controller.handleSendNotification(mockTask)).rejects.toThrow(
      'Telegram error',
    );
  });
});
