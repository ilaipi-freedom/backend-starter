import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skip_transform';

/**
 * 使用此装饰器的接口方法将不会被 TransformInterceptor 转换响应数据
 * 
 * @example
 * @Get()
 * @SkipTransform()
 * findAll() {
 *   return [...];
 * }
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true); 