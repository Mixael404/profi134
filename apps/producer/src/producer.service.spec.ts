import { Test, TestingModule } from '@nestjs/testing';
import { ProducerService } from './producer.service';
import { RetryService } from './retry.service';
import { QUEUE_PUBLISHER } from './queue-publisher.interface';
import {
  CreateNotificationDto,
  NOTIFICATION_EVENT,
  TASKS_QUEUE,
} from '@app/common';

describe('ProducerService', () => {
  let service: ProducerService;
  let publisher: { publish: jest.Mock };
  let retryService: { execute: jest.Mock };

  beforeEach(async () => {
    publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    retryService = {
      execute: jest.fn().mockImplementation((fn: () => Promise<unknown>) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        { provide: QUEUE_PUBLISHER, useValue: publisher },
        { provide: RetryService, useValue: retryService },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
  });

  it('should return success with a taskId', async () => {
    const dto: CreateNotificationDto = { chatId: '123', message: 'hello' };

    const result = await service.createTelegramTask(dto);

    expect(result.success).toBe(true);
    expect(typeof result.taskId).toBe('string');
    expect(result.taskId.length).toBeGreaterThan(0);
  });

  it('should publish to TASKS_QUEUE with persistent flag', async () => {
    const dto: CreateNotificationDto = { chatId: '42', message: 'test' };

    await service.createTelegramTask(dto);

    expect(publisher.publish).toHaveBeenCalledWith(
      TASKS_QUEUE,
      expect.any(Buffer),
      expect.objectContaining({ persistent: true }),
    );
  });

  it('should publish correct message payload', async () => {
    const dto: CreateNotificationDto = { chatId: '99', message: 'world' };

    await service.createTelegramTask(dto);

    const buffer: Buffer = publisher.publish.mock.calls[0][1];
    const body = JSON.parse(buffer.toString());

    expect(body.pattern).toBe(NOTIFICATION_EVENT);
    expect(body.data.type).toBe('notification_send');
    expect(body.data.payload.chatId).toBe('99');
    expect(body.data.payload.message).toBe('world');
  });

  it('should use retryService to publish', async () => {
    const dto: CreateNotificationDto = { chatId: '1', message: 'x' };

    await service.createTelegramTask(dto);

    expect(retryService.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate error when all retries fail', async () => {
    retryService.execute.mockRejectedValue(new Error('broker unavailable'));

    await expect(
      service.createTelegramTask({ chatId: '1', message: 'x' }),
    ).rejects.toThrow('broker unavailable');
  });
});
