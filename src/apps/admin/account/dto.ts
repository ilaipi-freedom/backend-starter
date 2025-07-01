import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

import { AvailableStatus } from 'src/generated/prisma';

import { BaseQuery } from 'src/types/BaseQuery';

export class CreateAccountDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ description: '角色ID' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '用户名' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: '密码' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '角色ID' })
  @IsString()
  @IsOptional()
  roleId?: string;
}

export class AccountQuery extends BaseQuery {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: '角色ID' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ description: '状态', enum: AvailableStatus })
  @IsOptional()
  @IsEnum(AvailableStatus)
  status?: AvailableStatus;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: '新密码',
    example: '********',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
