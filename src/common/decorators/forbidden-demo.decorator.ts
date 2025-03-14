import { SetMetadata } from '@nestjs/common';

/**
 * 装饰器：标记接口不允许demo角色访问
 * 使用方式：在控制器方法上添加 @NoDemo() 装饰器
 */
export const FORBIDDEN_DEMO_KEY = 'forbidden_demo_access';
export const ForbiddenDemo = () => SetMetadata(FORBIDDEN_DEMO_KEY, true);
