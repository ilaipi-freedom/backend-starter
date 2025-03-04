import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { Keyv } from '@keyv/redis';

import { KEYV_GLOBAL_KEY } from 'src/types/global';

@Injectable()
export class CacheHelperService implements OnModuleInit {
  private readonly logger = new Logger(CacheHelperService.name);
  private redisClient: RedisClientType;

  constructor(
    @Inject(KEYV_GLOBAL_KEY) private readonly keyv: Keyv,
  ) {}

  async onModuleInit() {
    try {
      this.redisClient = this.getRedisClient();
      this.setupRedisEventListeners();
      // 不等待连接验证，让它异步进行
      this.validateRedisConnection().catch(err => {
        this.logger.warn('Initial Redis connection check failed, but service will continue:', err.message);
      });
    } catch (error) {
      // 记录错误但不中断启动
      this.logger.warn('Redis client initialization warning:', error.message);
    }
  }

  getRedisClient(): RedisClientType {
    try {
      const client = this.keyv.store.client;
      if (!client) {
        throw new Error('Redis client is not initialized');
      }
      return client;
    } catch (error) {
      this.logger.warn('Getting Redis client warning:', error.message);
      throw error;
    }
  }

  private setupRedisEventListeners() {
    if (!this.redisClient) {
      this.logger.warn('Redis client not available for event setup');
      return;
    }

    this.redisClient.on('error', (err) => {
      this.logger.warn('Redis client error (non-fatal):', err.message);
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
    } catch (error) {
      this.logger.warn('Redis connection validation warning:', error.message);
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.warn('Redis health check warning:', error.message);
      return false;
    }
  }
}
