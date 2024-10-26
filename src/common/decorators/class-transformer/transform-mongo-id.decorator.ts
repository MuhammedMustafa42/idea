import { BadRequestException } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { Types } from 'mongoose';
import { CustomError } from 'src/common/classes';
import { ErrorType } from 'src/common/enums';

const isObjectId = (id: string | Types.ObjectId) =>
  new RegExp('^[0-9a-fA-F]{24}$').test(id?.toString() ?? '');

export function TransformObjectId() {
  return Transform(({ obj, key }: TransformFnParams) => {
    if (!isObjectId(obj[key])) {
      throw new BadRequestException(
        new CustomError({
          localizedMessage: {
            en: 'Invalid ObjectId',
            ar: 'ObjectId غير صالح',
          },
          errorType: ErrorType.INVALID,
          event: 'INVALID_OBJECT_ID',
        }),
      );
    }

    return new Types.ObjectId(obj[key]);
  });
}

export function TransformObjectIds() {
  return Transform(({ obj, key }: TransformFnParams) => {
    if (!Array.isArray(obj[key])) {
      throw new BadRequestException(
        new CustomError({
          localizedMessage: {
            en: 'Invalid ObjectId array',
            ar: 'ObjectId array غير صالح',
          },
          errorType: ErrorType.INVALID,
          event: 'INVALID_OBJECT_ID_ARRAY',
        }),
      );
    }

    return (obj[key] as Array<Types.ObjectId | string>).map((id) => {
      if (!isObjectId(id)) {
        throw new BadRequestException(
          new CustomError({
            localizedMessage: {
              en: 'Invalid ObjectId',
              ar: 'ObjectId غير صالح',
            },
            errorType: ErrorType.INVALID,
            event: 'INVALID_OBJECT_ID',
          }),
        );
      }

      return new Types.ObjectId(id);
    });
  });
}
