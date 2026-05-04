import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ApiGatewayService } from './api-gateway.service';
import { PRODUCER_CLIENT_TOKEN, CreateNotificationDto } from '@app/common';

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;
  let producerClient: { send: jest.Mock };

  const dto: CreateNotificationDto = { chatId: '123456789', message: 'hello' };

  beforeEach(async () => {
    producerClient = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiGatewayService,
        { provide: PRODUCER_CLIENT_TOKEN, useValue: producerClient },
      ],
    }).compile();

    service = module.get<ApiGatewayService>(ApiGatewayService);
  });

  it('should return result from producer', async () => {
    const expected = { success: true, taskId: 'uuid-1' };
    producerClient.send.mockReturnValue(of(expected));

    const result = await service.sendNotification(dto);

    expect(producerClient.send).toHaveBeenCalledWith('task_create', dto);
    expect(result).toEqual(expected);
  });

  it('should throw ServiceUnavailableException when producer returns error', async () => {
    producerClient.send.mockReturnValue(
      throwError(() => new Error('connection refused')),
    );

    await expect(service.sendNotification(dto)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should throw ServiceUnavailableException on timeout', async () => {
    jest.useFakeTimers();
    // Observable that never emits — will be killed by timeout(5000)
    producerClient.send.mockReturnValue(
      new (require('rxjs').Observable)(() => {}),
    );

    const promise = service.sendNotification(dto);
    jest.advanceTimersByTime(5001);

    await expect(promise).rejects.toThrow(ServiceUnavailableException);
    jest.useRealTimers();
  });
});
