import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { CreateNotificationDto } from '@app/common';

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;
  let service: jest.Mocked<ApiGatewayService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        { provide: ApiGatewayService, useValue: { sendNotification: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ApiGatewayController>(ApiGatewayController);
    service = module.get(ApiGatewayService);
  });

  it('should delegate to service and return result', async () => {
    const dto: CreateNotificationDto = { chatId: '123', message: 'hello' };
    const expected = { success: true, taskId: 'uuid-1' };
    service.sendNotification.mockResolvedValue(expected);

    const result = await controller.sendNotification(dto);

    expect(service.sendNotification).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });
});
