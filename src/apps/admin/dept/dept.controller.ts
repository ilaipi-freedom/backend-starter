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
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';

import { DeptService } from './dept.service';
import { CreateDeptDto } from './dto';
import { ForbiddenDemo } from 'src/common/decorators/forbidden-demo.decorator';

@ForbiddenDemo()
@ApiTags('部门')
@ApiBearerAuth()
@Controller('dept')
export class DeptController {
  constructor(private readonly service: DeptService) {}

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @ApiBody({ type: CreateDeptDto })
  create(
    @CurrentUser() user: AuthSession,
    @Body() createDeptDto: CreateDeptDto,
  ) {
    return this.service.create(user, createDeptDto);
  }

  @Get()
  @ApiOperation({ summary: '获取部门列表' })
  @ApiQuery({ name: 'q', description: '搜索关键字', required: false })
  findAll(@CurrentUser() user: AuthSession, @Query('q') q?: string) {
    return this.service.findAll(user, q);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树' })
  findDeptTree(@CurrentUser() user: AuthSession) {
    return this.service.findDeptTree(user);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  @ApiParam({ name: 'id', description: '部门ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  @ApiParam({ name: 'id', description: '部门ID' })
  @ApiBody({ type: CreateDeptDto })
  update(@Param('id') id: string, @Body() updateDeptDto: CreateDeptDto) {
    return this.service.update(id, updateDeptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @ApiParam({ name: 'id', description: '部门ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
