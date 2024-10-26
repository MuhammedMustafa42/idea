import { ModelNames } from '@common/constants';
import { FactoryProvider, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { userSchemaFactory } from 'src/common/schemas/mongoose/user/user.schema';
import { MongooseCommonModule } from '../common/common.module';

const UserMongooseDynamicModule: FactoryProvider = {
  provide: ModelNames.USER,
  inject: [getConnectionToken()],
  useFactory: userSchemaFactory,
};

const userProviders = [UserMongooseDynamicModule];

@Module({
  imports: [MongooseCommonModule.forRoot()],
  providers: userProviders,
  exports: userProviders,
})
export class UserMongooseModule {}
