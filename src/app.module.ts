import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule, RedisModuleOptions } from '@songkeys/nestjs-redis';
import { configSchema } from './common/validation';
import { BaseAuthModule } from './modules/auth/base-auth.module';
import { RouterModule } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from './common';
import { AwsSESModule } from './common/modules/aws-ses';
import { EmailService } from './common/services/email.service';
import { OrganizationModule } from './modules/organization/organization.module';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            host: configService.get<string>('REDIS_HOST') ?? 'redis',
            port: Number(configService.get<string>('REDIS_PORT')),
          },
        };
      },
    }),
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configSchema() }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    BaseAuthModule,
    RouterModule.register([{ path: 'auth', module: BaseAuthModule }]),
    PassportModule.register({ session: false, property: 'persona' }),
    AwsSESModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        accessKeyId: configService.get<string>('AWS_SES_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SES_SECRET_ACCESS_KEY'),
        region: configService.get<string>('AWS_SES_REGION'),
      }),
      inject: [ConfigService],
    }),
    OrganizationModule,
  ],

  providers: [AppConfig, EmailService],
})
export class AppModule {}
