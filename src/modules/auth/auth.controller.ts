import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Logging } from 'src/decorators/logging.decorator';
import { Request } from 'express';
import { ActionLogEnum } from 'src/enums/ActionLog.enum';

import { GetClientIP } from 'src/decorators/userIp.decorator';
import { Response } from 'express';
import { Authentication } from 'src/decorators/authentication.decorator';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { UserDocument } from '../../database/entity/user.entity';
import { SubjectEnum } from 'src/enums/index.enum';
import { ApiTags } from '@nestjs/swagger';
import {
  LogOutDocsAPI,
  RefreshTokenDocsAPI,
  SignInDocsAPI,
  SignUpDocsAPI,
} from './decorators/index.decorator';
import { CloudFlareTurnStileCapchaGuard } from 'src/guards/cloud-flare-turnstile-capcha.guard';
import { CloudFlareTurnStileCapChaApiDocs } from '../cloud-flare-turnstile/decorators/index.decorator';

@ApiTags('Authentication')
@Controller('auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SignUpDocsAPI()
  @Logging('Đăng ký tài khoản mới', ActionLogEnum.REGISTER, SubjectEnum.USER)
  @Post('/sign-up')
  signUp(
    @Body() createUserDto: CreateUserDto,
    @Req() request: Request,
    @GetClientIP() userIp: string,
  ) {
    return this.authService.signUp(createUserDto, request, userIp);
  }

  @SignInDocsAPI()
  @CloudFlareTurnStileCapChaApiDocs()
  @Logging('Đăng nhập', ActionLogEnum.LOGIN, SubjectEnum.USER)
  @UseGuards(CloudFlareTurnStileCapchaGuard)
  @HttpCode(200)
  @Post('/sign-in')
  signIn(
    @Body() user: LoginUserDto,
    @Req() request: Request,
    @GetClientIP() userIp: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(user, request, userIp, response);
  }

  @LogOutDocsAPI()
  @Authentication()
  @Post('logout')
  @HttpCode(204)
  async handleLogout(
    @AuthUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.logout(user, response);
  }

  @RefreshTokenDocsAPI()
  @Get('refresh-token')
  async handleRefreshToken(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return await this.authService.processNewToken(refresh_token, response);
  }
}
