import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, LoginResponseDto } from './dto';
import { AuthSession } from '../../types/auth';
import { CurrentUser } from '../helpers/current-user';
import { Public } from '../helpers/public';

@Controller('auth')
@ApiTags('认证')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(@Body() payload: LoginDto, @Req() req: Request) {
    return this.authService.signIn(payload, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('logout')
  async logout(@CurrentUser() payload: AuthSession) {
    return this.authService.signOut(payload);
  }

  /**
   * 修改密码接口
   * 修改当前登录用户的密码
   * @param payload 当前用户的会话信息
   * @param data 包含旧密码和新密码的请求体
   * @returns 修改结果
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '修改密码',
    description: '修改当前登录用户的密码，需要提供旧密码进行验证',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: '修改密码参数',
  })
  @ApiUnauthorizedResponse({
    description: '修改失败，可能的原因：1. 旧密码错误 2. 未登录或token已失效',
  })
  async changePassword(
    @CurrentUser() user: AuthSession,
    @Body() data: ChangePasswordDto,
    @Req() request: Request,
  ) {
    const ip = request.ip || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];
    return await this.authService.changePassword(user, data, {
      ip,
      userAgent,
    });
  }
}
