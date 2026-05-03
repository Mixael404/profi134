import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { connect, ChannelWrapper, Options } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { TASKS_QUEUE } from '@app/common';
import { IQueuePublisher } from './queue-publisher.interface';

@Injectable()
export class RmqPublisherService
  implements IQueuePublisher, OnApplicationBootstrap, OnApplicationShutdown
{
  private channelWrapper: ChannelWrapper;

  async onApplicationBootstrap() {
    const connection = connect([
      process.env.RABBITMQ_URL ?? 'amqp://rabbitmq:5672',
    ]);
    this.channelWrapper = connection.createChannel({
      confirm: true,
      setup: (channel: ConfirmChannel) =>
        channel.assertQueue(TASKS_QUEUE, { durable: true }),
    });
    await this.channelWrapper.waitForConnect();
  }

  async onApplicationShutdown() {
    await this.channelWrapper.close();
  }

  async publish(
    queue: string,
    content: Buffer,
    options: Options.Publish,
  ): Promise<void> {
    await this.channelWrapper.sendToQueue(queue, content, options);
  }
}
