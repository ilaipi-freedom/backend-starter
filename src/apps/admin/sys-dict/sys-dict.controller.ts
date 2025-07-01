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
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';
import { Prisma } from 'src/generated/prisma';

import { CreateSysDictDto, SysDictQuery } from './dto';
import { SysDictService } from './sys-dict.service';

@ApiTags('字典类型')
@ApiBearerAuth()
@Controller('sys-dict')
export class SysDictController {
  constructor(private readonly sysDictService: SysDictService) {}

  @Post()
  @ApiOperation({
    summary: '创建字典类型',
    description: '创建新的字典类型',
  })
  @ApiBody({
    type: CreateSysDictDto,
    description: '字典类型创建信息',
  })
  @ApiResponse({
    status: 201,
    description: '字典类型创建成功',
  })
  async createSysDict(
    @CurrentUser() user: AuthSession,
    @Body() payload: Prisma.SysDictCreateInput,
  ) {
    return this.sysDictService.create(user, payload);
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新字典类型',
    description: '更新指定ID的字典类型信息',
  })
  @ApiParam({
    name: 'id',
    description: '字典类型ID',
    type: String,
    example: '1',
  })
  @ApiBody({
    type: CreateSysDictDto,
    description: '字典类型更新信息',
  })
  @ApiResponse({
    status: 200,
    description: '字典类型更新成功',
  })
  async updateSysDict(
    @Param('id') id: string,
    @Body() payload: Prisma.SysDictCreateInput,
  ) {
    return this.sysDictService.update(id, payload);
  }

  @Get()
  @ApiOperation({
    summary: '获取字典类型列表',
    description: '分页获取字典类型列表，支持搜索和状态筛选',
  })
  @ApiQuery({
    type: SysDictQuery,
  })
  @ApiResponse({
    status: 200,
    description: '成功获取字典类型列表',
  })
  async list(@CurrentUser() user: AuthSession, @Query() query: SysDictQuery) {
    return this.sysDictService.list(user, query);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除字典类型',
    description: '删除指定ID的字典类型',
  })
  @ApiParam({
    name: 'id',
    description: '字典类型ID',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: '字典类型删除成功',
  })
  async deleteSysDict(@Param('id') id: string) {
    return this.sysDictService.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取字典类型详情',
    description: '获取指定ID的字典类型详细信息',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: '字典类型ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取字典类型详情',
  })
  async getById(@Param('id') id: string) {
    return this.sysDictService.getById(id);
  }
}
