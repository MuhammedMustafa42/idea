import { Module } from '@nestjs/common';
import { OrganizationService } from './controllers/organization.service';
import { OrganizationController } from './controllers/organization.controller';
import {
  OrganizationMongooseModule,
  UserMongooseModule,
} from 'src/common/modules';
import { AppConfig } from 'src/common';

@Module({
  providers: [OrganizationService, AppConfig],
  controllers: [OrganizationController],
  imports: [UserMongooseModule, OrganizationMongooseModule],
})
export class OrganizationModule {}
