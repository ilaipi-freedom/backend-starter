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
import * as ms from 'ms';
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
import { ChangePasswordDto, LoginDto } from './dto';
import { JsonValue } from '@prisma/client/runtime/library';
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
        corp: {
          select: {
            id: true,
            parentCorpId: true,
          },
        },
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
    const app = this.configService.get<string>('env.appInstance');
    const jwtConfig = this.configService.get<JwtModuleOptions>(
      `env.jwt.${app}`,
    );
    const expiresIn = (jwtConfig?.signOptions?.expiresIn as string) || '7d';

    const expiresInMs = ms(expiresIn as ms.StringValue);
    // 计算过期的时间戳（秒）
    const expiresAt = NP.plus(
      Math.floor((date?.getTime() || Date.now()) / 1000),
      Math.floor(NP.divide(expiresInMs, 1000)),
    );
    this.logger.log({ expiresAt }, '过期时间');
    return expiresAt;
  }

  /**
   * 用户登录
   * @param username 用户名
   * @param pass 密码
   * @param context 请求上下文，包含IP和UserAgent
   * @returns 登录成功的响应，包含token等信息
   */
  async signIn(payload: LoginDto, context: { ip: string; userAgent: string }) {
    try {
      const account = await this.verifyAccount(
        payload.username,
        payload.password,
      );

      return await this.prisma.$transaction(async (tx: PrismaService) => {
        // 记录登录日志
        const loginLog = await tx.loginLog.create({
          data: {
            accountId: account.id,
            username: account.username,
            ip: context.ip,
            userAgent: context.userAgent,
            status: 'SUCCESS',
            ...(payload.extra
              ? { extra: payload.extra as unknown as JsonValue }
              : {}),
          },
        });
        const expiresAt = this.getTokenExpireTime();
        const fingerprint = loginLog.id;

        const type = this.configService.get<AppInstanceEnum>('env.appInstance');
        const signPayload = {
          id: account.id,
          key: AuthSessionKeyEnum.AUTH,
          type,
          fingerprint,
        };
        const sessionKey = AuthHelper.sessionKey(signPayload);
        const token = await this.jwtService.signAsync(signPayload);

        const sessionParam = {
          id: account.id,
          type,
          role: account.role?.perm,
          corpId: account.corpId,
          username: account.username,
          lastLoginTime: new Date().toISOString(),
          fingerprint,
          isTopCorp: !account.corp?.parentCorpId,
        };

        // 使用 SET with EXAT 选项，一个原子操作完成设置值和过期时间
        await this.redisClient.set(sessionKey, JSON.stringify(sessionParam), {
          EXAT: expiresAt,
        });

        this.logger.log(
          {
            username: payload.username,
            accountId: account.id,
            ip: context.ip,
            userAgent: context.userAgent,
          },
          '用户登录成功',
        );

        return {
          id: account.id,
          role: account.role?.perm ? [account.role.perm] : [],
          token,
        };
      });
    } catch (error: unknown) {
      this.logger.error(
        {
          username: payload.username,
          ip: context.ip,
          userAgent: context.userAgent,
          error,
        },
        '用户登录失败',
      );
      throw error;
    }
  }

  async signOutAll(
    payload: Pick<AuthSession, 'id' | 'username' | 'type'>,
    context: { ip: string; userAgent: string },
  ) {
    try {
      const sessionKeyParam = {
        id: payload.id,
        key: AuthSessionKeyEnum.AUTH,
        type: payload.type,
      };

      await this.prisma.loginLog.create({
        data: {
          accountId: payload.id,
          username: payload.username,
          ip: context.ip,
          userAgent: context.userAgent,
          status: 'LOGOUT_ALL',
        },
      });
      const sessionKey = AuthHelper.sessionKey(sessionKeyParam);
      const keys = await this.redisClient.keys(`${sessionKey}:*`);
      await this.redisClient.del(keys);
    } catch (error: unknown) {
      this.logger.error(error, '登出所有失败');
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
        ...(payload.fingerprint ? { fingerprint: payload.fingerprint } : {}),
      };
      const sessionKey = AuthHelper.sessionKey(sessionKeyParam);

      // 记录登出日志
      await this.prisma.loginLog.create({
        data: {
          accountId: payload.id,
          username: payload.username,
          ip: context.ip,
          userAgent: context.userAgent,
          status: 'LOGOUT',
        },
      });

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
      throw new UnauthorizedException('Session invalid, please login again');
    }

    const session = JSON.parse(sessionStr) as AuthSession;
    return session;
  }

  /**
   * 修改用户密码
   * @param accountId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns 修改结果
   */
  async changePassword(
    user: AuthSession,
    payload: ChangePasswordDto,
    context: { ip: string; userAgent: string },
  ) {
    try {
      // 获取用户账号信息
      const account = await this.prisma.account.findUnique({
        where: { id: user.id },
      });

      if (!account) {
        throw new UnauthorizedException('用户不存在');
      }

      // 验证旧密码
      if (!(await argon2.verify(account.password, payload.oldPassword))) {
        this.logger.warn({ accountId: user.id }, '旧密码验证失败');
        throw new UnauthorizedException('旧密码错误');
      }

      // 生成新密码的哈希值
      const hashedPassword = await argon2.hash(payload.newPassword);

      // 更新密码
      await this.prisma.account.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      this.logger.log({ accountId: user.id }, '密码修改成功');

      await this.signOutAll(user, {
        ip: context.ip,
        userAgent: context.userAgent,
      });

      return {
        success: true,
        message: '密码修改成功',
      };
    } catch (error: unknown) {
      this.logger.error(
        {
          accountId: user.id,
          error,
        },
        '修改密码失败',
      );
      throw error;
    }
  }
}
