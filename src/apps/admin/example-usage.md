# NoDemo装饰器使用示例

这个文档展示了如何使用`@NoDemo()`装饰器来阻止demo角色访问特定接口。

## 在控制器方法上使用

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NoDemo } from 'src/common/auth/no-demo.decorator';

@Controller('example')
export class ExampleController {
  // 普通方法，demo角色可以访问GET请求，但不能访问PUT和DELETE请求
  @Get('public-data')
  getPublicData() {
    return { message: 'This data is accessible to all roles including demo' };
  }

  // 使用NoDemo装饰器，demo角色将无法访问此接口
  @Get('sensitive-data')
  @NoDemo()
  getSensitiveData() {
    return { message: 'This data is NOT accessible to demo roles' };
  }

  // 即使是GET请求，添加了NoDemo装饰器后，demo角色也无法访问
  @Get('admin-only/:id')
  @NoDemo()
  getAdminOnlyData(@Param('id') id: string) {
    return { message: `Admin only data for ID: ${id}` };
  }

  // 对于POST请求，demo角色可以访问（因为没有NoDemo装饰器也不是PUT/DELETE方法）
  @Post('create-temp')
  createTemporaryItem(@Body() data: any) {
    return { message: 'Demo can create temporary items' };
  }
}
```

## 在整个控制器上使用

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { NoDemo } from 'src/common/auth/no-demo.decorator';

// 整个控制器都禁止demo角色访问
@Controller('admin-panel')
@NoDemo()
export class AdminPanelController {
  @Get('stats')
  getAdminStats() {
    return { message: 'Admin statistics' };
  }

  @Post('settings')
  updateSettings() {
    return { message: 'Settings updated' };
  }
}
```

## 使用说明

1. 对于特定的方法，只需添加`@NoDemo()`装饰器
2. 对于整个控制器，可以在控制器类上添加`@NoDemo()`装饰器
3. 即使没有`@NoDemo()`装饰器，所有PUT和DELETE请求仍然会被DemoRoleGuard拦截 