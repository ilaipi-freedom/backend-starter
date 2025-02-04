import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';

import { CreateMenuDto } from './dto';
import { SysMenuService } from './sys-menu.service';

@ApiTags('系统菜单')
@ApiBearerAuth()
@Controller('sys-menu')
export class SysMenuController {
  constructor(private readonly service: SysMenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.service.create(createMenuDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取完整菜单树' })
  findAllMenuTree() {
    return this.service.findAllMenuTree();
  }

  @Get('user-tree')
  @ApiOperation({ summary: '获取当前用户的菜单树' })
  findUserMenuTree(@CurrentUser() user: AuthSession) {
    return this.service.findUserMenuTree(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新菜单' })
  update(@Param('id') id: string, @Body() updateMenuDto: CreateMenuDto) {
    return this.service.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
