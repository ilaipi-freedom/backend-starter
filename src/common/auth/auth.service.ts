import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Cache } from 'cache-manager';
import { subMinutes } from 'date-fns';

import { AuthSession, AuthSessionKey } from '../../types/auth';
import { AuthHelper } from '../helpers/auth-helper';
import NP from '../helpers/number-helper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async verifyAccount(username: string, pass: string) {
    const account = await this.prisma.account.findUnique({
      where: {
        username,
      },
      include: {
        role: true,
      },
    });
    if (!account) {
      this.logger.log({ username }, '用户不存在，登录失败');
      throw new UnauthorizedException('登录失败!');
    }
    if (await argon2.verify(account.password, pass)) {
      return account;
    } else {
      this.logger.log({ username }, '密码错误，登录失败');
      throw new UnauthorizedException('登录失败!');
    }
  }

  async signIn(username: string, pass: string) {
    const account = await this.verifyAccount(username, pass);
    const type = await this.configService.get('env.appInstance');
    const payload = { id: account.id, key: 'AUTH', type };
    const sessionKey = AuthHelper.sessionKey(payload);
    const token = await this.jwtService.signAsync(payload);
    // token的过期时间，比当前时间会早一点点
    // 为了保证token过期前，缓存不会丢失，计算过期时间的时候，留一分钟冗余时间
    const now = subMinutes(Date.now(), 1).getTime();
    const tokenVerified = await this.jwtService.verifyAsync(token);
    const ttl = NP.minus(tokenVerified.exp * 1000, now).toFixed(0);
    const sessionParam = {
      id: account.id,
      type,
      username: account.username,
      token,
      role: account.role.perm,
      corpId: account.corpId,
    };
    await this.cacheManager.set(
      sessionKey,
      JSON.stringify(sessionParam),
      Number(ttl),
    );
    return {
      id: account.id,
      role: account.role.perm,
      token,
    };
  }

  async signOut(payload: AuthSession) {
    const sessionKeyParam = { id: payload.id, key: 'AUTH', type: payload.type };
    const sessionKey = AuthHelper.sessionKey(sessionKeyParam);
    await this.cacheManager.del(sessionKey);
  }

  async validateUser(payload: AuthSessionKey) {
    const sessionKey = AuthHelper.sessionKey(payload);
    const session = await this.cacheManager.get(sessionKey);
    if (session) {
      return JSON.parse(session as string);
    }
    throw new UnauthorizedException('登录已失效!');
  }
}
