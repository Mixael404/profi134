import { Options } from 'amqp-connection-manager';

export const QUEUE_PUBLISHER = 'QUEUE_PUBLISHER';

export interface IQueuePublisher {
  publish(
    queue: string,
    content: Buffer,
    options: Options.Publish,
  ): Promise<void>;
}
