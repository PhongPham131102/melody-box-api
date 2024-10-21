import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StatusResponse } from 'src/common/StatusResponse';
import { CloudFlareTurnstileService } from 'src/modules/cloud-flare-turnstile/cloud-flare-turnstile.service';

export class CloudFlareTurnStileCapchaGuard implements CanActivate {
  constructor(
    private readonly cloudFlareTurnstileService: CloudFlareTurnstileService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const captchaToken =
      request.body['cf-turnstile-response'] ||
      request.headers['cf-turnstile-response'];
    if (!captchaToken)
      throw new HttpException(
        {
          status: StatusResponse.TOKEN_CLOUDFLARE_IS_REQUIRE,
          message:
            'Token Cloud Flare TurnStile Is Required Please Check Payload',
        },
        HttpStatus.BAD_REQUEST,
      );
    const isValid =
      await this.cloudFlareTurnstileService.validateCaptcha(captchaToken);
    if (!isValid)
      throw new HttpException(
        {
          status: StatusResponse.TOKEN_CLOUDFLARE_NOT_VALID,
          message:
            'Token Cloud Flare TurnStile May Be Expire Or Not Valid Please Reload Page and Try Again!',
        },
        HttpStatus.BAD_REQUEST,
      );
    return true;
  }
}
