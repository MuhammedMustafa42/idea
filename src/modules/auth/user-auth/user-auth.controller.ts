import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import {
  IUserInstanceMethods,
  User,
} from 'src/common/schemas/mongoose/user/user.type';
import { LoginEmailDto } from '../dto/login-email.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LoginEmailGuard } from '../guards/login-email.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { IRefreshTokenPayload } from '../strategies/refresh-token/refresh-token-strategy-payload.interface';
import { UserAuthService } from './user-auth.service';
import { CustomResponse } from 'src/common/classes';
import { Persona } from '@common/decorators/params/persona.decorator';

@Controller('user')
@ApiTags('auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('register')
  async registerUserByEmail(@Body() body: RegisterUserDto) {
    const user = await this.userAuthService.signupUser(body);

    return new CustomResponse().success({
      payload: { data: user },
    });
  }

  @Post('verify-signup-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const user =
      await this.userAuthService.verifySignupEmailVerificationCode(body);

    return new CustomResponse().success({
      payload: { data: user },
    });
  }

  @UseGuards(LoginEmailGuard)
  @Post('login-email')
  async loginUserByEmail(
    @Persona() user: HydratedDocument<User, IUserInstanceMethods>,
    @Body() body: LoginEmailDto,
  ) {
    const loginPayload = await this.userAuthService.loginUser(body, user);

    return new CustomResponse().success({
      payload: { data: loginPayload },
    });
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(@Persona() payload: IRefreshTokenPayload) {
    const user = await this.userAuthService.refreshUserTokens(payload);

    return new CustomResponse().success({
      payload: { data: user },
      localizedMessage: {
        en: 'Token refreshed successfully',
        ar: 'تم تحديث الرقم السري بنجاح',
      },
      event: 'TOKEN_REFRESHED_SUCCESS',
    });
  }
}
