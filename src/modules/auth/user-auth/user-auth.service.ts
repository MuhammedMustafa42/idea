import { ModelNames } from '@common/constants';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@songkeys/nestjs-redis';
import { HydratedDocument } from 'mongoose';
import { AppConfig, ErrorType } from 'src/common';
import { CustomError } from 'src/common/classes';
import {
  IPendingUserModel,
  PendingUser,
} from 'src/common/schemas/mongoose/user/pending-user/pending-user.type';
import {
  IUserInstanceMethods,
  IUserModel,
  User,
} from 'src/common/schemas/mongoose/user/user.type';
import { EmailService } from 'src/common/services/email.service';
import { BaseAuthService } from '../base-auth.service';
import { LoginEmailDto } from '../dto/login-email.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { IRefreshTokenPayload } from '../strategies/refresh-token/refresh-token-strategy-payload.interface';

@Injectable()
export class UserAuthService extends BaseAuthService {
  constructor(
    @Inject(ModelNames.USER) private _userModel: IUserModel,
    private readonly _appConfig: AppConfig,
    private readonly _jwtService: JwtService,
    @Inject(ModelNames.PENDING_USER)
    private pendingUserModel: IPendingUserModel,
    private readonly emailService: EmailService,
    private readonly _redisService: RedisService,
  ) {
    super(_userModel, _appConfig, _jwtService, _redisService);
  }

  async loginUser(
    payload: LoginEmailDto,
    user: HydratedDocument<User, IUserInstanceMethods>,
  ) {
    const { password } = payload;

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException(
        new CustomError({
          localizedMessage: {
            en: 'Incorrect Email or password',
            ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          },
          event: 'LOGIN_FAILED',
          errorType: ErrorType.UNAUTHORIZED,
        }),
      );
    }

    return this.handleUserLoginAndGenerateTokens(user._id);
  }

  async signupUser({ email, password, name }: RegisterUserDto) {
    const user = await this.userModel.findOne({ email });

    if (user) {
      throw new BadRequestException(
        new CustomError({
          localizedMessage: {
            en: 'Email Already Exists',
            ar: 'البريد الإلكتروني موجود بالفعل',
          },
          event: 'EMAIL_ALREADY_EXISTS',
          errorType: ErrorType.WRONG_INPUT,
        }),
      );
    }

    const attempts = await this.redis.get(`${email}-trials`);

    if (Number(attempts) >= 3) {
      throw new ForbiddenException(
        new CustomError({
          localizedMessage: {
            en: 'You have exceeded the maximum number of attempts, please try again later',
            ar: 'لقد تجاوزت الحد الأقصى لعدد المحاولات ، يرجى المحاولة مرة أخرى لاحقًا',
          },
          event: 'MAX_ATTEMPTS_EXCEEDED',
          errorType: ErrorType.FORBIDDEN,
        }),
      );
    }

    let pendingUser: HydratedDocument<PendingUser> =
      await this.pendingUserModel.findOne({ email });

    pendingUser = pendingUser || new this.pendingUserModel();

    pendingUser.set({
      email,
      password,
      name,
    });

    const savedPendingUser = (await pendingUser.save()).toJSON();

    delete savedPendingUser.password;

    const code = await this.generateEmailVerificationCode(email, attempts);

    return code;
  }

  async verifySignupEmailVerificationCode({ email, code }: VerifyEmailDto) {
    const pendingUser = await this.pendingUserModel.findOne({ email });

    if (!pendingUser) {
      throw new UnauthorizedException(
        new CustomError({
          localizedMessage: {
            en: 'Incorrect email',
            ar: 'البريد الإلكتروني غير صحيح',
          },
          event: 'INCORRECT_EMAIL',
          errorType: ErrorType.WRONG_REQUEST,
        }),
      );
    }

    await this.validateEmailVerificationCode({ email, code });

    let newUser = await this.userModel.findOne({ email });
    newUser = newUser || new this.userModel();

    newUser.set({
      email: pendingUser.email,
      password: pendingUser.password,
      name: pendingUser.name,
    });

    newUser.unmarkModified('password');

    await newUser.save();
    await pendingUser.deleteOne();

    return this.handleUserLoginAndGenerateTokens(newUser._id);
  }

  async refreshUserTokens(payload: IRefreshTokenPayload) {
    const { _id: userId, sessionId } = payload;

    const [userSessions, user] = await Promise.all([
      this.redis.lrange(userId, 0, -1),
      this.userModel.findById(userId, { email: 1, role: 1 }),
    ]);

    if (!userSessions?.length || !userSessions?.includes(sessionId)) {
      throw new UnauthorizedException(
        new CustomError({
          localizedMessage: {
            en: 'Invalid session',
            ar: 'جلسة غير صالحة',
          },
          event: 'INVALID_SESSION',
          errorType: ErrorType.UNAUTHORIZED,
        }),
      );
    }

    return {
      ...user.toJSON(),
      ...(await this.generateAccessToken(user, sessionId)),
    };
  }

  private async generateEmailVerificationCode(
    email: string,
    attempts?: string,
  ) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Promise.all([
      this.redis.set(
        `${email}-trials`,
        (Number(attempts) || 0) + 1,
        'EX',
        3600,
      ), // 1 hour
      this.redis.set(`${email}-verify`, code, 'EX', 600), // 10 minutes
    ]);

    return code;
  }

  private async validateEmailVerificationCode({ email, code }: VerifyEmailDto) {
    const storedCode = await this.redis.get(`${email}-verify`);

    if (storedCode !== code) {
      throw new UnauthorizedException(
        new CustomError({
          localizedMessage: {
            en: 'Incorrect code',
            ar: 'الرمز غير صحيح',
          },
          event: 'INCORRECT_CODE',
          errorType: ErrorType.WRONG_REQUEST,
        }),
      );
    }

    await Promise.all([
      this.redis.del(`${email}-verify`),
      this.redis.del(`${email}-trials`),
    ]);
  }
}
