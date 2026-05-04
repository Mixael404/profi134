import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { CreateNotificationDto } from '@app/common';

describe('ProducerController', () => {
  let controller: ProducerController;
  let service: jest.Mocked<ProducerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [
        { provide: ProducerService, useValue: { createTelegramTask: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProducerController>(ProducerController);
    service = module.get(ProducerService);
  });

  it('should delegate to service and return result', async () => {
    const dto: CreateNotificationDto = { chatId: '42', message: 'hi' };
    const expected = { success: true, taskId: 'uuid-1' };
    service.createTelegramTask.mockResolvedValue(expected);

    const result = await controller.createTelegramTask(dto);

    expect(service.createTelegramTask).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });
});
