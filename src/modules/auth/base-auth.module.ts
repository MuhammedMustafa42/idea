import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from 'src/common';
import { PendingUserMongooseModule } from 'src/common/modules/mongoose/user/pending-user/pending-user.module';
import { UserMongooseModule } from 'src/common/modules/mongoose/user/user.module';
import { LoginEmailGuard } from './guards/login-email.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { LoginEmailStrategy } from './strategies/login-email/login-email.strategy';
import { RefreshTokenStrategyService } from './strategies/refresh-token/refresh-token-strategy.service';
import { RefreshTokenStrategy } from './strategies/refresh-token/refresh-token.strategy';
import { UserAuthController } from './user-auth/user-auth.controller';
import { UserAuthService } from './user-auth/user-auth.service';
import { EmailService } from 'src/common/services/email.service';

@Module({
  providers: [
    UserAuthService,
    AppConfig,
    RefreshTokenStrategyService,
    RefreshTokenStrategy,
    RefreshTokenGuard,
    LoginEmailGuard,
    LoginEmailStrategy,
    EmailService,
  ],
  controllers: [UserAuthController],
  imports: [
    PassportModule.register({ session: false, property: 'persona' }),
    UserMongooseModule,
    PendingUserMongooseModule,
  ],
})
export class BaseAuthModule {}
