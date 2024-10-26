import { ModelNames } from '@common/constants';
import { FactoryProvider, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { organizationSchemaFactory } from 'src/common/schemas/mongoose/organization/organization.schema';
import { MongooseCommonModule } from '../common/common.module';

const OrganizationMongooseDynamicModule: FactoryProvider = {
  provide: ModelNames.ORGANIZATION,
  inject: [getConnectionToken()],
  useFactory: organizationSchemaFactory,
};

const organizationProviders = [OrganizationMongooseDynamicModule];

@Module({
  imports: [MongooseCommonModule.forRoot()],
  providers: organizationProviders,
  exports: organizationProviders,
})
export class OrganizationMongooseModule {}
