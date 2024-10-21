import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { ErrorInterceptor } from './interceptors/handleError.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { ActionHistoryModule } from './modules/action-history/action-history.module';
import { JwtModule } from '@nestjs/jwt';
import { LoggingInterceptor } from './interceptors/save-logging.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { Mp3ApiModule } from './modules/mp3-api/mp3-api.module';
import { YoutubeApiModule } from './modules/youtube-api/youtube-api.module';
import { DatabaseModule } from './database/database.module';
import { CloudFlareTurnstileModule } from './modules/cloud-flare-turnstile/cloud-flare-turnstile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.EXPIRES_ACCESS_TOKEN_JWT },
    }),
    UserModule,
    DatabaseModule,
    PermissionModule,
    RoleModule,
    ActionHistoryModule,
    AuthModule,
    Mp3ApiModule,
    YoutubeApiModule,
    CloudFlareTurnstileModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
