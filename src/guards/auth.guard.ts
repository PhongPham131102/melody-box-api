import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/modules/user/user.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY || 'init_authorization',
      });

      const userId = payload?.user_id ?? undefined;

      if (!payload.user_id) throw new UnauthorizedException();

      const user = await this.userService.getUserByIdAuthGuard(userId);

      if (!user) throw new UnauthorizedException();
      request['user'] = user;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('EXPIRED_ACCESS_TOKEN');
      }
      throw new UnauthorizedException();
    }
    return true;
  }
}
