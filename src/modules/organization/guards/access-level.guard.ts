import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { SetMetadata } from '@nestjs/common';
import { AppConfig } from 'src/common';

export const ACCESS_LEVEL_KEY = 'accessLevel';

export const AccessLevel = (level: string) =>
  SetMetadata(ACCESS_LEVEL_KEY, level);

@Injectable()
export class AccessLevelGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private readonly appConfig: AppConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAccessLevel = this.reflector.get<string>(
      ACCESS_LEVEL_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authorization token not found');
    }

    const token = authHeader.split(' ')[1];

    const payload = this.jwtService.verify(token, {
      secret: this.appConfig.USER_JWT_SECRET,
    });
    const userAccessLevel = payload.accessLevel;

    if (this.isAccessLevelAllowed(userAccessLevel, requiredAccessLevel)) {
      return true;
    } else {
      throw new ForbiddenException('Insufficient access level');
    }
  }

  private isAccessLevelAllowed(
    userAccessLevel: string,
    requiredAccessLevel: string,
  ): boolean {
    const accessLevels = ['one', 'two', 'three'];
    const userIndex = accessLevels.indexOf(userAccessLevel);
    const requiredIndex = accessLevels.indexOf(requiredAccessLevel);

    return userIndex >= requiredIndex;
  }
}
