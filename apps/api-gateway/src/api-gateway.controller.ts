import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from '@app/common/dto/create-task.dto';
import { ApiGatewayService } from './api-gateway.service';

@ApiTags('notifications')
@Controller('notifications')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({ summary: 'Send Telegram notification' })
  @ApiAcceptedResponse({ description: 'Task accepted and queued' })
  sendNotification(@Body() dto: CreateNotificationDto) {
    return this.apiGatewayService.sendNotification(dto);
  }
}
