import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

import { TAuthSession } from 'src/types/auth';

import { IS_PUBLIC_KEY } from '../helpers/public';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    try {
      const canActivate = (await super.canActivate(context)) as boolean;
      return canActivate;
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (err instanceof Error && err.message === 'No auth token') {
        throw new UnauthorizedException('No token provided');
      }
      throw err;
    }
  }
  handleRequest<TUser = TAuthSession>(
    err: unknown,
    user: TUser,
    info: unknown,
  ) {
    if (err || !user) {
      if (info && info instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (info && info instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
