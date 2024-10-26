import { ModelNames } from '@common/constants';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ErrorType } from 'src/common';
import { CustomError } from 'src/common/classes';
import { IUserModel } from 'src/common/schemas/mongoose/user/user.type';

@Injectable()
export class LoginEmailStrategy extends PassportStrategy(
  Strategy,
  'user-login-email',
) {
  constructor(@Inject(ModelNames.USER) private userModel: IUserModel) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.userModel.findOne(
      { email },
      { email: 1, password: 1 },
    );

    if (!user) {
      throw new UnauthorizedException(
        new CustomError({
          localizedMessage: {
            en: 'Incorrect email or password',
            ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          },
          event: 'LOGIN_FAILED',
          errorType: ErrorType.UNAUTHORIZED,
        }),
      );
    }

    return user;
  }
}
