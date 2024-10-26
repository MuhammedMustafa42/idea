import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { handleAuthGuardRequest } from 'src/common/helpers/auth-guard-error.helper';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('user-refresh-token') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    return handleAuthGuardRequest(err, user, info, context, status);
  }
}
