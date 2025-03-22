import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvailableStatus } from '@prisma/client';
import ms, { StringValue } from 'ms';
import { RedisClientType } from '@redis/client';

import { AppInstanceEnum } from 'src/types/helper';

import { PrismaService } from '../prisma/prisma.service';
import { AuthHelper } from '../helpers/auth-helper';
import {
  AuthSession,
  AuthSessionKey,
  AuthSessionKeyEnum,
} from '../../types/auth';
import { CacheHelperService } from '../cache-helper/cache-helper.service';
import NP from '../helpers/number-helper';

/**
 * 认证服务
 * 处理用户登录、登出、会话管理等认证相关功能
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** 登录尝试过期时间（30分钟） */
  private readonly LOGIN_ATTEMPT_EXPIRE = 30 * 60;
  /** 最大登录尝试次数 */
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private redisClient: RedisClientType;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cacheHelper: CacheHelperService,
  ) {
    this.redisClient = this.cacheHelper.getRedisClient();
  }

  /**
   * 检查用户登录尝试次数
   * 如果超过最大尝试次数，将抛出异常
   * @param username 用户名
   */
  private async checkLoginAttempts(username: string): Promise<void> {
    const attemptsKey = `login_attempts:${username}`;
    const attempts = (await this.cacheManager.get<number>(attemptsKey)) || 0;

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      throw new UnauthorizedException('登录尝试次数过多，请30分钟后再试');
    }
  }

  /**
   * 增加用户登录尝试次数
   * @param username 用户名
   */
  private async incrementLoginAttempts(username: string): Promise<void> {
    const attemptsKey = `login_attempts:${username}`;
    const attempts =
      ((await this.cacheManager.get<number>(attemptsKey)) || 0) + 1;
    await this.cacheManager.set(
      attemptsKey,
      attempts,
      this.LOGIN_ATTEMPT_EXPIRE,
    );
  }

  /**
   * 重置用户登录尝试次数
   * @param username 用户名
   */
  private async resetLoginAttempts(username: string): Promise<void> {
    const attemptsKey = `login_attempts:${username}`;
    await this.cacheManager.del(attemptsKey);
  }

  /**
   * 验证用户账号和密码
   * 包含登录尝试次数检查和账号状态检查
   * @param username 用户名
   * @param pass 密码
   * @returns 验证通过的用户账号信息
   * @throws UnauthorizedException 当验证失败时
   */
  async verifyAccount(username: string, pass: string) {
    // 检查登录尝试次数
    await this.checkLoginAttempts(username);

    const account = await this.prisma.account.findUnique({
      where: {
        username,
      },
      include: {
        role: true,
      },
    });

    if (!account) {
      await this.incrementLoginAttempts(username);
      this.logger.warn({ username }, '用户不存在，登录失败');
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查账号状态
    if (account.status === AvailableStatus.forbidden) {
      this.logger.warn({ username }, '账号已禁用，登录失败');
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    if (await argon2.verify(account.password, pass)) {
      // 登录成功，重置尝试次数
      await this.resetLoginAttempts(username);
      return account;
    } else {
      await this.incrementLoginAttempts(username);
      this.logger.warn({ username }, '密码错误，登录失败');
      throw new UnauthorizedException('用户名或密码错误');
    }
  }

  getTokenExpireTime(date?: Date) {
    const app = this.configService.get<AppInstanceEnum>('env.appInstance');
    const jwtConfig = this.configService.get<JwtModuleOptions>(
      `env.jwt.${app}`,
    );
    const expiresIn = (jwtConfig?.signOptions?.expiresIn as string) || '7d';

    const expiresInMs = ms(expiresIn as StringValue);
    // 计算过期的时间戳（秒）
    const expiresAt = NP.plus(
      Math.floor((date?.getTime() || Date.now()) / 1000),
      Math.floor(NP.divide(expiresInMs, 1000)),
    );
    return expiresAt;
  }

  /**
   * 用户登录
   * @param username 用户名
   * @param pass 密码
   * @param context 请求上下文，包含IP和UserAgent
   * @returns 登录成功的响应，包含token等信息
   */
  async signIn(
    username: string,
    pass: string,
    context?: { ip: string; userAgent: string },
  ) {
    try {
      const account = await this.verifyAccount(username, pass);
      const expiresAt = this.getTokenExpireTime();

      const type = this.configService.get<AppInstanceEnum>('env.appInstance');
      const payload: AuthSessionKey = {
        id: account.id,
        key: AuthSessionKeyEnum.AUTH,
        type,
      };
      const sessionKey = AuthHelper.sessionKey(payload);
      const token = await this.jwtService.signAsync(payload);

      const sessionParam = {
        id: account.id,
        type,
        role: account.role?.perm,
        username: account.username,
        corpId: account.corpId,
        lastLoginTime: new Date().toISOString(),
      };

      // 使用 SET with EXAT 选项，一个原子操作完成设置值和过期时间
      await this.redisClient.set(sessionKey, JSON.stringify(sessionParam), {
        EXAT: expiresAt,
      });

      this.logger.log(
        {
          username,
          accountId: account.id,
          ip: context?.ip,
          userAgent: context?.userAgent,
        },
        '用户登录成功',
      );

      return {
        id: account.id,
        role: account.role?.perm ? [account.role.perm] : [],
        token,
      };
    } catch (error: unknown) {
      this.logger.error(
        {
          username,
          ip: context?.ip,
          userAgent: context?.userAgent,
          error,
        },
        '用户登录失败',
      );
      throw error;
    }
  }

  /**
   * 用户登出
   * @param payload 用户会话信息
   * @param context 请求上下文，包含IP和UserAgent
   * @returns 登出成功的响应
   */
  async signOut(
    payload: AuthSession,
    context?: { ip: string; userAgent: string },
  ) {
    try {
      const sessionKeyParam = {
        id: payload.id,
        key: AuthSessionKeyEnum.AUTH,
        type: payload.type,
      };
      const sessionKey = AuthHelper.sessionKey(sessionKeyParam);

      await this.redisClient.del(sessionKey);
      this.logger.log(
        {
          accountId: payload.id,
          ip: context?.ip,
          userAgent: context?.userAgent,
        },
        '用户登出成功',
      );

      return { success: true, message: '登出成功' };
    } catch (error: unknown) {
      this.logger.error(
        {
          accountId: payload.id,
          ip: context?.ip,
          userAgent: context?.userAgent,
          error,
        },
        '用户登出失败',
      );
      throw new UnauthorizedException('登出失败，请重试');
    }
  }

  /**
   * 验证用户会话
   * @param payload 会话密钥信息
   * @returns 验证通过的会话信息
   * @throws UnauthorizedException 当会话无效时
   */
  async validateUser(payload: AuthSessionKey) {
    const sessionKey = AuthHelper.sessionKey(payload);

    const sessionStr = await this.redisClient.get(sessionKey);

    if (!sessionStr) {
      this.logger.warn(
        {
          sessionKey,
        },
        'AuthService validateUser - No session found',
      );
      throw new UnauthorizedException('Session not found');
    }

    const session = JSON.parse(sessionStr) as AuthSession;
    return session;
  }
}
