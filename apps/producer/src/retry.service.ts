import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async execute<T>(
    fn: () => Promise<T>,
    context: string,
    maxAttempts = 3,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === maxAttempts) throw err;
        const delay = 500 * 2 ** (attempt - 1);
        this.logger.warn(
          `${context} failed, retry ${attempt}/${maxAttempts - 1} in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
