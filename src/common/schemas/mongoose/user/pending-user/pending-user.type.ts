import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Model } from 'mongoose';

import { User } from '../user.type';

export class PendingUser extends PickType(User, [
  'email',
  'password',
] as const) {
  constructor(pendingUser: PendingUser) {
    super(pendingUser);
    Object.assign(this, pendingUser);
  }

  @IsString()
  @IsNotEmpty()
  name: string;
}

export interface IPendingUserInstanceMethods {}
export interface IPendingUserModel
  extends Model<
    PendingUser,
    Record<string, unknown>,
    IPendingUserInstanceMethods
  > {}
