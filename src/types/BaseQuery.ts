import { ApiProperty } from '@nestjs/swagger';

export class BaseQuery {
  @ApiProperty()
  page?: number;
  @ApiProperty()
  pageSize?: number;
  @ApiProperty({
    default: false,
  })
  isAll?: boolean;
}
