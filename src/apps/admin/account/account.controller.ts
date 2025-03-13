import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';

import { AccountService } from './account.service';

@ApiTags('账号')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Get('/info')
  async info(@CurrentUser() user: AuthSession) {
    return this.service.getAccountInfo(user);
  }

  @Get('/permCode')
  @ApiOperation({
    summary: '获取当前用户权限码',
    description: '获取当前登录用户的所有权限码',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取权限码列表',
  })
  async permCode(@CurrentUser() user: AuthSession) {
    return this.service.getPermCode(user);
  }

  @Get('/permCode/:roleId')
  @ApiOperation({
    summary: '获取指定角色权限码',
    description: '根据角色ID获取对应的权限码列表',
  })
  @ApiParam({
    name: 'roleId',
    description: '角色ID',
    example: 'role123456',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取角色权限码列表',
  })
  async permCodeByRole(@Param('roleId') roleId: string) {
    return this.service.getPermCodeByRole(roleId);
  }
}
