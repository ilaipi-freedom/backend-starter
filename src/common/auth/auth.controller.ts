import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto';
import { AuthSession } from '../../types/auth';
import { CurrentUser } from '../helpers/current-user';
import { Public } from '../helpers/public';

@Controller('auth')
@ApiTags('认证')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(@Body() payload: LoginDto) {
    return this.authService.signIn(payload.username, payload.password);
  }

  @Post('logout')
  async logout(@CurrentUser() payload: AuthSession) {
    return this.authService.signOut(payload);
  }
}
