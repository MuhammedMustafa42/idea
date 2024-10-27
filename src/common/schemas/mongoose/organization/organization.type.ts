import { TransformObjectIds } from '@common/decorators/class-transformer/transform-mongo-id.decorator';
import {
  IsArray,
  IsInstance,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Model, Types } from 'mongoose';

export class Organization {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @IsInstance(Types.ObjectId, { each: true })
  @TransformObjectIds()
  @IsOptional()
  members?: Types.ObjectId[];
}

export interface IOrganizationModel
  extends Model<Organization, Record<string, unknown>> {}
