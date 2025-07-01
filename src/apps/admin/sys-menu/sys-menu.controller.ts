import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ForbiddenDemo } from 'src/common/decorators/forbidden-demo.decorator';
import { CurrentUser } from 'src/common/helpers/current-user';
import { AuthSession } from 'src/types/auth';

import { CreateMenuDto } from './dto';
import { SysMenuService } from './sys-menu.service';

@ForbiddenDemo()
@ApiTags('系统菜单')
@ApiBearerAuth()
@Controller('sys-menu')
export class SysMenuController {
  constructor(private readonly service: SysMenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiBody({
    type: CreateMenuDto,
  })
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
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiOperation({ summary: '获取菜单详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiOperation({ summary: '更新菜单' })
  @ApiBody({
    type: CreateMenuDto,
  })
  update(@Param('id') id: string, @Body() updateMenuDto: CreateMenuDto) {
    return this.service.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: '菜单ID' })
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
