import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { Keyv } from '@keyv/redis';

import { KEYV_GLOBAL_KEY } from 'src/types/global';

@Injectable()
export class CacheHelperService implements OnModuleInit {
  private redisClient: RedisClientType;
  private readonly logger = new Logger(CacheHelperService.name);

  constructor(@Inject(KEYV_GLOBAL_KEY) private readonly keyv: Keyv) {}

  onModuleInit() {
    try {
      this.redisClient = this.getRedisClient();
      this.setupRedisEventListeners();
      // 不等待连接验证，让它异步进行
      this.validateRedisConnection().catch((err: unknown) => {
        this.logger.warn(
          { err },
          'Initial Redis connection check failed, but service will continue',
        );
      });
    } catch (error: unknown) {
      // 记录错误但不中断启动
      this.logger.warn({ error }, 'Redis client initialization warning');
    }
  }

  getRedisClient(): RedisClientType {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const client = this.keyv.store.client as RedisClientType;
      if (!client) {
        throw new Error('Redis client is not initialized');
      }
      return client;
    } catch (error: unknown) {
      this.logger.warn({ error }, 'Getting Redis client warning');
      throw error;
    }
  }

  private setupRedisEventListeners() {
    if (!this.redisClient) {
      this.logger.warn('Redis client not available for event setup');
      return;
    }

    this.redisClient.on('error', (err: unknown) => {
      this.logger.warn({ err }, 'Redis client error (non-fatal)');
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.log('Redis client reconnecting...');
    });

    this.redisClient.on('end', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  private async validateRedisConnection() {
    try {
      await this.redisClient.ping();
      this.logger.log('Redis connection validated successfully');
      return true;
    } catch (error: unknown) {
      this.logger.warn({ error }, 'Redis connection validation warning');
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error: unknown) {
      this.logger.warn({ error }, 'Redis health check warning');
      return false;
    }
  }
}
