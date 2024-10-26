import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AppConfig, ErrorType } from 'src/common';
import { CustomError } from 'src/common/classes';

@Injectable()
export class JwtDecodedGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private readonly appConfig: AppConfig,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const noBearer = this.reflector.get<boolean>(
      'JWT_GUARD_METADATA_KEY',
      context.getHandler(),
    );

    if (noBearer) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const token = req?.headers?.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = this.jwtService.verify(token, {
          secret: this.appConfig.USER_JWT_SECRET,
        });

        req.persona = decoded;
        return true;
      } catch (error) {
        throw new UnauthorizedException(
          new CustomError({
            localizedMessage: {
              en: 'Invalid Access Token',
              ar: 'رمز الوصول غير صالح',
            },
            errorType: ErrorType.UNAUTHORIZED,
            event: 'UNAUTHORIZED',
          }),
        );
      }
    }

    throw new UnauthorizedException(
      new CustomError({
        localizedMessage: {
          en: 'No Token Provided',
          ar: 'رمز الوصول غير مرفق',
        },
        errorType: ErrorType.UNAUTHORIZED,
        event: 'UNAUTHORIZED',
      }),
    );
  }
}
