import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransformToLowerCase } from '@common/decorators/class-transformer';
import { TransformTrim } from '@common/decorators/class-transformer';
import { Model } from 'mongoose';

export class User {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @TransformToLowerCase()
  @TransformTrim()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  accessLevel?: string;
}

export interface IUserInstanceMethods {
  comparePassword(password: string): Promise<boolean>;
}
export interface IUserModel
  extends Model<User, Record<string, unknown>, IUserInstanceMethods> {}
