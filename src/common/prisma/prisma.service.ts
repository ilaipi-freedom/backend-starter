import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
  }
  private async connectWithRetry(
    maxRetries: number,
    delay: number,
  ): Promise<void> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        await this.$connect();
        this.logger.log('Connected to the database successfully.');
        return;
      } catch (error) {
        attempts++;
        this.logger.error(
          `Database connection attempt ${attempts} failed:`,
          error,
        );

        if (attempts >= maxRetries) {
          this.logger.error('Maximum connection attempts reached. Exiting...');
          throw error;
        }

        this.logger.log(`Retrying to connect to the database in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleInit() {
    const MAX_RETRIES = 5; // 最大重试次数
    const RETRY_DELAY = 2000; // 每次重试的间隔时间（毫秒）
    await this.connectWithRetry(MAX_RETRIES, RETRY_DELAY);
  }
}
