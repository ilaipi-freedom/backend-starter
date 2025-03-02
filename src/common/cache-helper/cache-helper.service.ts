import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisClientType } from '@redis/client';

@Injectable()
export class CacheHelperService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  getRedisClient(): RedisClientType {
    return this.cacheManager.stores[0].store.client as RedisClientType;
  }
}
