import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { TelegramTask } from '@app/common';

describe('ConsumerController', () => {
  let controller: ConsumerController;
  let service: jest.Mocked<ConsumerService>;

  const mockTask: TelegramTask = {
    id: 'task-123',
    type: 'notification_send',
    payload: { chatId: '42', message: 'hello' },
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const makeContext = (redelivered: boolean) => {
    const channel = { ack: jest.fn(), nack: jest.fn() };
    const message = { fields: { redelivered } };
    return {
      channel,
      message,
      ctx: {
        getChannelRef: () => channel,
        getMessage: () => message,
      } as unknown as RmqContext,
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumerController],
      providers: [
        {
          provide: ConsumerService,
          useValue: { processTaskFromQueue: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ConsumerController>(ConsumerController);
    service = module.get(ConsumerService);
  });

  it('should ack message after successful processing', async () => {
    service.processTaskFromQueue.mockResolvedValue(undefined);
    const { ctx, channel, message } = makeContext(false);

    await controller.handleNotificationSend(mockTask, ctx);

    expect(service.processTaskFromQueue).toHaveBeenCalledWith(mockTask);
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('should nack with requeue=true on first attempt failure', async () => {
    service.processTaskFromQueue.mockRejectedValue(new Error('fail'));
    const { ctx, channel, message } = makeContext(false);

    await controller.handleNotificationSend(mockTask, ctx);

    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it('should nack with requeue=false on redelivered message failure', async () => {
    service.processTaskFromQueue.mockRejectedValue(new Error('fail'));
    const { ctx, channel, message } = makeContext(true);

    await controller.handleNotificationSend(mockTask, ctx);

    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
    expect(channel.ack).not.toHaveBeenCalled();
  });
});
