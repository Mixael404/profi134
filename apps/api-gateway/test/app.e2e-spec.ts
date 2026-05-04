import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { of, throwError } from 'rxjs';
import { ApiGatewayModule } from '../src/api-gateway.module';
import { PRODUCER_CLIENT_TOKEN } from '@app/common';

describe('ApiGateway (e2e)', () => {
  let app: INestApplication;
  const mockProducerClient = { send: jest.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    })
      .overrideProvider(PRODUCER_CLIENT_TOKEN)
      .useValue(mockProducerClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await app.close();
  });

  describe('POST /notifications', () => {
    it('should return 202 with task result on valid request', async () => {
      mockProducerClient.send.mockReturnValue(
        of({ success: true, taskId: 'uuid-123' }),
      );

      await request(app.getHttpServer())
        .post('/notifications')
        .send({ chatId: '123456789', message: 'Hello!' })
        .expect(202)
        .expect({ success: true, taskId: 'uuid-123' });
    });

    it('should return 400 when chatId is missing', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .send({ message: 'No chatId here' })
        .expect(400);
    });

    it('should return 400 when message is missing', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .send({ chatId: '123' })
        .expect(400);
    });

    it('should return 400 on empty body', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .send({})
        .expect(400);
    });

    it('should return 400 when fields are empty strings', async () => {
      await request(app.getHttpServer())
        .post('/notifications')
        .send({ chatId: '', message: '' })
        .expect(400);
    });

    it('should return 503 when producer is unavailable', async () => {
      mockProducerClient.send.mockReturnValue(
        throwError(() => new Error('connection refused')),
      );

      await request(app.getHttpServer())
        .post('/notifications')
        .send({ chatId: '123', message: 'hello' })
        .expect(503);
    });
  });
});
