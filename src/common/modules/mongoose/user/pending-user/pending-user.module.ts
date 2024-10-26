import { ModelNames } from '@common/constants';
import { FactoryProvider, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { pendingUserSchemaFactory } from 'src/common/schemas/mongoose/user/pending-user/pending-user.schema';

const PendingUserMongooseDynamicModule: FactoryProvider = {
  provide: ModelNames.PENDING_USER,
  inject: [getConnectionToken()],
  useFactory: pendingUserSchemaFactory,
};

const pendingUserProviders = [PendingUserMongooseDynamicModule];

@Module({
  imports: [],
  providers: pendingUserProviders,
  exports: pendingUserProviders,
})
export class PendingUserMongooseModule {}