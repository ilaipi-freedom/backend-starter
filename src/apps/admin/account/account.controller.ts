import { Controller, Get, Param, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';

import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto, AccountQuery, ResetPasswordDto } from './dto';

@ApiTags('账号')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Get('/info')
  async info(@CurrentUser() user: AuthSession) {
    return this.service.getAccountInfo(user);
  }

  @Get('/permBtnCodes')
  @ApiOperation({
    summary: '获取当前用户权限按钮码',
    description: '获取当前登录用户的所有权限按钮码',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取权限按钮码列表',
  })
  async permBtnCodes(@CurrentUser() user: AuthSession) {
    return this.service.getPermBtnCodes(user);
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
  
  @Post()
  @ApiOperation({ summary: '创建账户' })
  @ApiBody({ type: CreateAccountDto })
  async create(
    @Body() dto: CreateAccountDto,
    @CurrentUser() user: AuthSession,
  ) {
    return this.service.create(user, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新账户' })
  @ApiBody({ type: UpdateAccountDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @CurrentUser() user: AuthSession,
  ) {
    return this.service.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除账户' })
  @ApiParam({ name: 'id', description: '账户ID' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthSession) {
    return this.service.delete(user, id);
  }

  @Get()
  @ApiOperation({ summary: '获取账户列表' })
  @ApiQuery({ type: AccountQuery })
  async findAll(
    @Query() query: AccountQuery,
    @CurrentUser() user: AuthSession,
  ) {
    return this.service.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取账户详情' })
  @ApiParam({ name: 'id', description: '账户ID' })
  async findById(@Param('id') id: string, @CurrentUser() user: AuthSession) {
    return this.service.findById(user, id);
  }

  @Put('resetPassword/:id')
  @ApiOperation({
    summary: '重置密码',
    description: '管理员重置用户密码，仅管理员可操作',
  })
  @ApiParam({
    name: 'id',
    description: '账号ID',
    example: 'account123456',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: '新密码信息',
  })
  @ApiResponse({
    status: 200,
    description: '密码重置成功',
  })
  @ApiResponse({
    status: 403,
    description: '无权限操作',
  })
  async resetPassword(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.service.resetPassword(id, payload);
  }
}
