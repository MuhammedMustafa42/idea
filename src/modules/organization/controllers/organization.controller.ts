import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { JwtDecodedGuard } from 'src/modules/auth/guards/jwt-decode.guard';
import { CustomResponse } from 'src/common/classes';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { AccessLevel, AccessLevelGuard } from '../guards/access-level.guard';
import { InviteUserDto } from '../dto/invite-user.dto';

@Controller('organization')
@ApiTags('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'create new organization' })
  @UseGuards(JwtDecodedGuard, AccessLevelGuard)
  @AccessLevel('one')
  @Post('user/private/organizations')
  async createOrganization(@Body() body: CreateOrganizationDto) {
    const result = await this.organizationService.createOrganization(body);

    return new CustomResponse().success({
      payload: { data: result },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'list all organizations' })
  @UseGuards(JwtDecodedGuard, AccessLevelGuard)
  @AccessLevel('two')
  @Get('user/private/organizations')
  async listAllTasks() {
    const result = await this.organizationService.listAllOrganizations();

    return new CustomResponse().success({
      payload: { data: result },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get organization by id' })
  @UseGuards(JwtDecodedGuard, AccessLevelGuard)
  @AccessLevel('one')
  @Get('user/private/organizations/:organizationId')
  async getOrganizationById(@Param('organizationId') organizationId: string) {
    const result =
      await this.organizationService.getOrganizationById(organizationId);

    return new CustomResponse().success({
      payload: { data: result },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'update organization by id' })
  @UseGuards(JwtDecodedGuard, AccessLevelGuard)
  @AccessLevel('one')
  @Patch('user/private/organizations/:organizationId')
  async updateOrganizationById(
    @Param('organizationId') organizationId: string,
    @Body() body: UpdateOrganizationDto,
  ) {
    const result = await this.organizationService.updateOrganizationById(
      organizationId,
      body,
    );

    return new CustomResponse().success({
      payload: { data: result },
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'delete organization by id' })
  @UseGuards(JwtDecodedGuard, AccessLevelGuard)
  @AccessLevel('three')
  @Delete('user/private/organizations/:organizationId')
  async deleteOrganization(@Param('organizationId') organizationId: string) {
    await this.organizationService.deleteOrganization(organizationId);

    return new CustomResponse().success({});
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'invite user to organizations' })
  @UseGuards(JwtDecodedGuard, AccessLevelGuard)
  @AccessLevel('one')
  @Post('user/private/organizations/:organizationId/invite')
  async inviteUserToOrganization(
    @Param('organizationId') organizationId: string,
    @Body() body: InviteUserDto,
  ) {
    const result = await this.organizationService.inviteUserToOrganization(
      organizationId,
      body,
    );

    return new CustomResponse().success({
      payload: { data: result },
    });
  }
}
