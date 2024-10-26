import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfig, ErrorType } from 'src/common';
import { RefreshTokenStrategyService } from './refresh-token-strategy.service';
import { IRefreshTokenPayload } from './refresh-token-strategy-payload.interface';
import { CustomError } from 'src/common/classes';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'user-refresh-token',
) {
  constructor(
    private readonly appConfig: AppConfig,
    private readonly refreshTokenStrategyService: RefreshTokenStrategyService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfig.USER_JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: IRefreshTokenPayload) {
    const session =
      this.refreshTokenStrategyService.validateUserSession(payload);

    if (!session) {
      throw new UnauthorizedException(
        new CustomError({
          localizedMessage: {
            en: 'Unfortunately, your session is expired',
            ar: 'للأسف ، جلستك منتهي',
          },
          event: 'REFRESH_TOKEN_FAILED',
          errorType: ErrorType.UNAUTHORIZED,
        }),
      );
    }

    return payload;
  }
}
