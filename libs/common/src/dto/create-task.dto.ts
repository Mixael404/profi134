import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: '123456789', description: 'Telegram chat ID' })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({ example: 'Hello!', description: 'Message text' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
