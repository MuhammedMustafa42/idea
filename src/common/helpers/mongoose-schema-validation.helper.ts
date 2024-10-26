import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Validator } from 'class-validator';
import { Document } from 'mongoose';
import { parseValidationErrors } from './validation-error-parser.helper';
import { ErrorType } from '../enums';
import { CustomError } from '../classes';

type ClassType = new (...args: any[]) => any;

export async function validateSchema(
  doc: Document,
  validationClass: ClassType,
) {
  const instance = plainToInstance(validationClass, doc.toObject(), {
    enableImplicitConversion: true,
  });

  const validator = new Validator();
  const validationErrors = await validator.validate(instance, {
    skipMissingProperties: true,
  });

  if (validationErrors.length > 0) {
    const errors = parseValidationErrors(validationErrors);

    throw new InternalServerErrorException(
      new CustomError({
        localizedMessage: {
          en: 'Model Validation Error',
          ar: 'خطأ في التحقق من النموذج',
        },
        errorType: ErrorType.WRONG_INPUT,
        error: errors,
        event: 'VALIDATION_ERROR',
      }),
    );
  }
}
