import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class CloudFlareTurnstileService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('CLOUD_FLARE_TURNSTILE_URL')
    private readonly urlCloudFlareTurnStile: string,
  ) {}
  private readonly logger = new Logger(CloudFlareTurnstileService.name);

  async validateCaptcha(token: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(this.urlCloudFlareTurnStile, {
            secret: process.env.CLOUD_FLARE_TURNSTILE_SECRET_KEY,
            response: token,
          })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error(`Captcha validation failed: ${error}`);
              throw error;
            }),
          ),
      );
      return response.success;
    } catch (error) {
      this.logger.error(`Error during CAPTCHA validation: ${error}`);
      return false;
    }
  }
}
