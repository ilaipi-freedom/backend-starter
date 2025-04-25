import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminLoginExtraDto {
  @ApiPropertyOptional({
    description: '屏幕分辨率  window.screen.width',
    example: '123456',
  })
  screenWidth: number;

  @ApiPropertyOptional({
    description: '屏幕高度  window.screen.height',
    example: '123456',
  })
  screenHeight: number;

  @ApiPropertyOptional({
    description: '视窗宽度  window.innerWidth',
    example: '123456',
  })
  viewportWidth: number;

  @ApiPropertyOptional({
    description: '视窗高度  window.innerHeight',
    example: '123456',
  })
  viewportHeight: number;

  @ApiPropertyOptional({
    description: '时区  Intl.DateTimeFormat().resolvedOptions().timeZone',
    example: '123456',
  })
  timezone: string;

  @ApiPropertyOptional({
    description: '语言设置  navigator.language || navigator.userLanguage',
    example: '123456',
  })
  language: string;

  @ApiPropertyOptional({
    description: '硬件并发  navigator.hardwareConcurrency',
    example: '123456',
  })
  hardwareConcurrency: number;
}
export class LoginDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;

  @ApiPropertyOptional({
    description: '额外信息',
    example: '123456',
  })
  extra?: AdminLoginExtraDto;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '用户在系统中的id',
  })
  id: string;
  @ApiProperty({
    description:
      '角色。暂时分为：admin / partner 合作伙伴 / insurance 保险公司',
  })
  role: string;
  @ApiProperty({
    description: 'jwt token，后续请求中要带着',
  })
  token: string;
}

export class ChangePasswordDto {
  /** 旧密码 */
  oldPassword: string;

  /** 新密码 */
  newPassword: string;
}
