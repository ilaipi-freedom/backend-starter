import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuthSession } from 'src/types/auth';

import { FORBIDDEN_DEMO_KEY } from '../decorators/forbidden-demo.decorator';

/**
 * Demo角色权限拦截守卫
 * 1. 拦截角色权限值为demo的用户的PUT和DELETE请求
 * 2. 拦截使用了@ForbiddenDemo()装饰器的接口的所有demo角色请求
 */
@Injectable()
export class DemoRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const user = request.user as AuthSession;

    // 如果用户角色不是demo，则直接通过
    // 如果是GET请求，则直接通过
    if (user?.role !== 'demo' || method === 'GET') {
      return true;
    }

    // 检查当前路由是否被标记为不允许demo访问
    const isForbiddenDemo = this.reflector.getAllAndOverride<boolean>(
      FORBIDDEN_DEMO_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果接口标记了@NoDemo()装饰器，则拒绝所有demo用户访问
    if (isForbiddenDemo) {
      throw new ForbiddenException('演示账号无权访问此接口');
    }

    // 如果是PUT或DELETE请求，则拒绝demo用户访问
    if (method === 'PUT' || method === 'DELETE') {
      throw new ForbiddenException('演示账号无权执行修改或删除操作');
    }

    return true;
  }
}
