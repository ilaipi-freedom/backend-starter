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
import { SysDictDataQuery } from 'src/common/sys-dict-helper/dto';

import { CreateSysDictDataDto } from './dto';
import { SysDictDataService } from './sys-dict-data.service';

@ApiTags('字典数据')
@ApiBearerAuth()
@Controller('sys-dict-data')
export class SysDictDataController {
  constructor(private readonly sysDictDataService: SysDictDataService) {}

  @Post()
  @ApiOperation({
    summary: '创建字典数据',
    description: '创建新的字典数据项',
  })
  @ApiBody({
    type: CreateSysDictDataDto,
    description: '字典数据创建信息',
  })
  @ApiResponse({
    status: 201,
    description: '字典数据创建成功',
  })
  async createSysDictData(
    @CurrentUser() user: AuthSession,
    @Body() payload: CreateSysDictDataDto,
  ) {
    return this.sysDictDataService.create(user, payload);
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新字典数据',
    description: '更新指定ID的字典数据信息',
  })
  @ApiParam({
    name: 'id',
    description: '字典数据ID',
    type: String,
    example: '1',
  })
  @ApiBody({
    type: CreateSysDictDataDto,
    description: '字典数据更新信息',
  })
  @ApiResponse({
    status: 200,
    description: '字典数据更新成功',
  })
  async updateSysDictData(
    @Param('id') id: string,
    @Body() payload: CreateSysDictDataDto,
  ) {
    return this.sysDictDataService.update(id, payload);
  }

  @Get()
  @ApiOperation({
    summary: '获取字典数据列表',
    description: '分页获取字典数据列表，支持按类型和关键字搜索',
  })
  @ApiQuery({
    type: SysDictDataQuery,
  })
  @ApiResponse({
    status: 200,
    description: '成功获取字典数据列表',
  })
  async list(
    @CurrentUser() user: AuthSession,
    @Query() query: SysDictDataQuery,
  ) {
    return this.sysDictDataService.list(user, query);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除字典数据',
    description: '删除指定ID的字典数据',
  })
  @ApiParam({
    name: 'id',
    description: '字典数据ID',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: '字典数据删除成功',
  })
  async deleteSysDictData(@Param('id') id: string) {
    return this.sysDictDataService.remove(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取字典数据详情',
    description: '获取指定ID的字典数据详细信息',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: '字典数据ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取字典数据详情',
  })
  async getById(@Param('id') id: string) {
    return this.sysDictDataService.getById(id);
  }
}
