import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramServiceService } from './telegram-service.service';

const mockSendMessage = jest.fn();
const mockCommand = jest.fn();
const mockLaunch = jest.fn().mockResolvedValue(undefined);
const mockStop = jest.fn();

jest.mock('telegraf', () => ({
  Telegraf: jest.fn().mockImplementation(() => ({
    command: mockCommand,
    launch: mockLaunch,
    stop: mockStop,
    telegram: { sendMessage: mockSendMessage },
  })),
}));

describe('TelegramServiceService', () => {
  let service: TelegramServiceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramServiceService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<TelegramServiceService>(TelegramServiceService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should register /start and /my_id commands on init', () => {
    service.onModuleInit();

    expect(mockCommand).toHaveBeenCalledWith('start', expect.any(Function));
    expect(mockCommand).toHaveBeenCalledWith('my_id', expect.any(Function));
  });

  it('should launch bot on module init', () => {
    service.onModuleInit();

    expect(mockLaunch).toHaveBeenCalled();
  });

  it('should stop bot with SIGTERM on module destroy', () => {
    service.onModuleDestroy();

    expect(mockStop).toHaveBeenCalledWith('SIGTERM');
  });

  it('should send message via Telegram API after delay', async () => {
    mockSendMessage.mockResolvedValue(undefined);

    const promise = service.sendMessage('123', 'Hello!');
    jest.advanceTimersByTime(2000);
    await promise;

    expect(mockSendMessage).toHaveBeenCalledWith('123', 'Hello!');
  });

  it('should propagate Telegram API error', async () => {
    mockSendMessage.mockRejectedValue(new Error('Forbidden'));

    const promise = service.sendMessage('123', 'Hi');
    jest.advanceTimersByTime(2000);

    await expect(promise).rejects.toThrow('Forbidden');
  });

  it('/my_id handler should reply with chat id', () => {
    service.onModuleInit();
    const handler = mockCommand.mock.calls.find(
      ([cmd]) => cmd === 'my_id',
    )?.[1];
    const ctx = { chat: { id: 42 }, reply: jest.fn() };

    handler(ctx);

    expect(ctx.reply).toHaveBeenCalledWith('42');
  });

  it('/start handler should reply with welcome message', () => {
    service.onModuleInit();
    const handler = mockCommand.mock.calls.find(
      ([cmd]) => cmd === 'start',
    )?.[1];
    const ctx = { chat: { id: 1 }, reply: jest.fn() };

    handler(ctx);

    expect(ctx.reply).toHaveBeenCalledWith(expect.any(String));
  });
});
