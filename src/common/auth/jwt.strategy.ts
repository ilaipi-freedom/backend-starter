import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthSessionKey } from '../../types/auth';

/**
 * JWT认证策略
 * 用于验证请求中的JWT令牌，并从缓存中获取对应的用户会话信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      // 从请求头的Authorization字段中提取Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略JWT的过期时间
      ignoreExpiration: false,
      // 使用配置的密钥进行验证
      secretOrKey: configService.get(`env.jwt.secret`),
    });
  }

  /**
   * 验证JWT令牌中的payload
   * 在每个需要认证的请求中被调用
   * @param payload JWT令牌中的payload
   * @returns 用户会话信息
   * @throws UnauthorizedException 当会话无效时
   */
  async validate(payload: AuthSessionKey) {
    try {
      const session = await this.authService.validateUser(payload);
      return session;
    } catch (error) {
      throw error;
    }
  }
}
