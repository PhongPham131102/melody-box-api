import { Controller } from '@nestjs/common';
import { CloudFlareTurnstileService } from './cloud-flare-turnstile.service';

@Controller('cloud-flare-turnstile')
export class CloudFlareTurnstileController {
  constructor(
    private readonly cloudFlareTurnstileService: CloudFlareTurnstileService,
  ) {}
}
