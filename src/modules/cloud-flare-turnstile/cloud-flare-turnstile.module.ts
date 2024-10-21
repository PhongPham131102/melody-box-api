import { Module } from '@nestjs/common';
import { CloudFlareTurnstileService } from './cloud-flare-turnstile.service';
import { CloudFlareTurnstileController } from './cloud-flare-turnstile.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [CloudFlareTurnstileController],
  providers: [
    CloudFlareTurnstileService,
    {
      provide: 'CLOUD_FLARE_TURNSTILE_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('CLOUD_FLARE_TURNSTILE_URL'),
      inject: [ConfigService],
    },
  ],
  exports: [CloudFlareTurnstileService],
})
export class CloudFlareTurnstileModule {}
