import { PartialType, PickType } from '@nestjs/swagger';
import { Organization } from 'src/common/schemas/mongoose/organization/organization.type';

export class UpdateOrganizationDto extends PartialType(
  PickType(Organization, ['name', 'description'] as const),
) {}
