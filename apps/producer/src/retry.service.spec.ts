import { Test, TestingModule } from '@nestjs/testing';
import { RetryService } from './retry.service';

describe('RetryService', () => {
  let service: RetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryService],
    }).compile();

    service = module.get<RetryService>(RetryService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return result immediately on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    const result = await service.execute(fn, 'ctx');

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on second attempt', async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const promise = service.execute(fn, 'ctx');
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting all attempts', async () => {
    jest.useFakeTimers();
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    // Attach rejection handler BEFORE advancing timers to avoid unhandled rejection
    const assertion = expect(service.execute(fn, 'ctx', 3)).rejects.toThrow(
      'always fails',
    );
    await jest.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff: 500ms then 1000ms', async () => {
    jest.useFakeTimers();
    const delays: number[] = [];
    jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((cb: () => void, ms?: number) => {
        delays.push(ms ?? 0);
        cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });

    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValue('ok');

    await service.execute(fn, 'ctx', 3);

    expect(delays).toEqual([500, 1000]);
  });

  it('should not retry if maxAttempts is 1', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(service.execute(fn, 'ctx', 1)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
