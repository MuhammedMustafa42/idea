import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig, ErrorType, parseValidationErrors } from './common';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { CustomError } from './common/classes';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerModuleConfig } from './common/interfaces';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      persona?: any;
    }
  }
}

async function bootstrap(swaggerConfig: SwaggerModuleConfig) {
  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(AppConfig);

  const appShortName = appConfig.APP_SHORT_NAME;

  app.setGlobalPrefix(appShortName);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          new CustomError({
            localizedMessage: {
              en: 'Validation failed',
              ar: 'فشل التحقق من الصحة',
            },
            errorType: ErrorType.WRONG_INPUT,
            event: 'VALIDATION_FAILED',
            error: parseValidationErrors(validationErrors),
          }),
        );
      },
    }),
  );

  app.enableCors({
    origin: true,
    methods: '*',
    allowedHeaders: '*',
    optionsSuccessStatus: 204,
  });

  const {
    title = appConfig.APP_SHORT_NAME,
    version,
    description,
  } = swaggerConfig.config;

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description ?? '')
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${appShortName}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
bootstrap({ enabled: true, config: { version: '1.0.0' } });
