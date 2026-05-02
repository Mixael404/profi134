import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateNotificationDto } from '@app/common/dto/create-task.dto';
import { ApiGatewayService } from './api-gateway.service';

@Controller('notifications')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post()
  @HttpCode(202)
  sendNotification(@Body() dto: CreateNotificationDto) {
    return this.apiGatewayService.sendNotification(dto);
  }
}
