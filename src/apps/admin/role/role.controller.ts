import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AvailableStatus, Prisma } from '@prisma/client';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { RoleService } from './role.service';
import { CreateRoleDto, RoleListQueryDto } from './dto';
import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';
import { ForbiddenDemo } from 'src/common/decorators/forbidden-demo.decorator';

@ForbiddenDemo()
@Controller('role')
@ApiTags('角色')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Post()
  @ApiOperation({
    summary: '创建角色',
    description: '创建新的系统角色',
  })
  @ApiBody({
    type: CreateRoleDto,
    description: '角色创建信息',
  })
  @ApiResponse({
    status: 201,
    description: '角色创建成功',
  })
  async createRole(
    @CurrentUser() user: AuthSession,
    @Body() payload: CreateRoleDto,
  ) {
    return this.roleService.create(user, payload);
  }
  @Put(':id')
  @ApiOperation({
    summary: '更新角色',
    description: '更新指定角色的信息',
  })
  @ApiParam({
    name: 'id',
    description: '角色ID',
    example: 'role123456',
  })
  @ApiBody({
    type: CreateRoleDto,
    description: '角色更新信息',
  })
  @ApiResponse({
    status: 200,
    description: '角色更新成功',
  })
  async updateRole(
    @Param('id') id: string,
    @Body() payload: CreateRoleDto,
  ) {
    return this.roleService.update(id, payload);
  }

  @Get('list')
  @ApiOperation({
    summary: '获取角色列表',
    description: '分页获取角色列表，支持搜索和状态筛选',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取角色列表',
  })
  async list(
    @CurrentUser() user: AuthSession,
    @Query() query: RoleListQueryDto,
  ) {
    return this.roleService.list(user, query);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除角色',
    description: '删除指定ID的角色',
  })
  @ApiParam({
    name: 'id',
    description: '角色ID',
    example: 'role123456',
  })
  @ApiResponse({
    status: 200,
    description: '角色删除成功',
  })
  async deleteRole(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取角色详情',
    description: '获取指定ID的角色详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '角色ID',
    example: 'role123456',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取角色详情',
  })
  async getById(@Param('id') id: string) {
    return this.roleService.getById(id);
  }

  @Put('updatePerm/:id')
  @ApiOperation({
    summary: '更新角色权限',
    description: '更新指定角色的权限列表',
  })
  @ApiParam({
    name: 'id',
    description: '角色ID',
    example: 'role123456',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        perms: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: '权限码列表',
          example: ['sys:user:view', 'sys:user:edit'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '权限更新成功',
  })
  async updatePerm(
    @Param('id') id: string,
    @Body() payload: { perms: string[] },
  ) {
    return this.roleService.updatePerm(id, payload.perms);
  }
}
