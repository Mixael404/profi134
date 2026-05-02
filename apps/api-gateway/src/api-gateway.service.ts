import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { CreateNotificationDto, PRODUCER_CLIENT_TOKEN } from '@app/common';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor(
    @Inject(PRODUCER_CLIENT_TOKEN)
    private readonly producerClient: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.producerClient.connect();
  }

  async sendNotification(dto: CreateNotificationDto) {
    return firstValueFrom(
      this.producerClient.send('task_create', dto).pipe(
        timeout(5000),
        catchError((err) =>
          throwError(() => new ServiceUnavailableException(err.message)),
        ),
      ),
    ).then((result) => {
      this.logger.log(`Task queued: ${result.taskId}`);
      return result;
    });
  }
}
