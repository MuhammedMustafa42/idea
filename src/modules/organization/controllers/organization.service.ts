import { ModelNames } from '@common/constants';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IOrganizationModel } from 'src/common/schemas/mongoose/organization/organization.type';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { Types } from 'mongoose';
import { CustomError } from 'src/common/classes';
import { ErrorType } from 'src/common';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { IUserModel } from 'src/common/schemas/mongoose/user/user.type';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(ModelNames.ORGANIZATION)
    private organizationModel: IOrganizationModel,
    @Inject(ModelNames.USER)
    private userModel: IUserModel,
  ) {}

  async createOrganization(body: CreateOrganizationDto) {
    const newOrganization = await this.organizationModel.create(body);

    return newOrganization;
  }

  async listAllOrganizations() {
    const organizations = await this.organizationModel.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
          as: 'members',
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          memebers: 1,
        },
      },
    ]);

    return organizations;
  }

  async getOrganizationById(organizationId: string) {
    const [organization] = await this.organizationModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(organizationId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
          as: 'members',
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          memebers: 1,
        },
      },
    ]);

    if (!organization) {
      throw new NotFoundException(
        new CustomError({
          localizedMessage: {
            en: 'Organization Not Found',
            ar: 'المنظمة غير موجود',
          },
          event: 'Not_Found',
          errorType: ErrorType.NOT_FOUND,
        }),
      );
    }

    return organization;
  }

  async updateOrganizationById(
    organizationId: string,
    body: UpdateOrganizationDto,
  ) {
    const organization = await this.organizationModel.findById(organizationId);

    if (!organization) {
      throw new NotFoundException(
        new CustomError({
          localizedMessage: {
            en: 'Organization Not Found',
            ar: 'المنظمة غير موجود',
          },
          event: 'Not_Found',
          errorType: ErrorType.NOT_FOUND,
        }),
      );
    }

    organization.set(body);
    await organization.save();

    return organization;
  }

  async deleteOrganization(organizationId: string) {
    const organization = await this.organizationModel.findById(organizationId);

    if (!organization) {
      throw new NotFoundException(
        new CustomError({
          localizedMessage: {
            en: 'Organization Not Found',
            ar: 'المنظمة غير موجود',
          },
          event: 'Not_Found',
          errorType: ErrorType.NOT_FOUND,
        }),
      );
    }

    await this.organizationModel.deleteOne({
      _id: new Types.ObjectId(organizationId),
    });
  }

  async inviteUserToOrganization(
    organizationId: string,
    body: { email: string },
  ) {
    const organization = await this.organizationModel.findById(organizationId);

    if (!organization) {
      throw new NotFoundException(
        new CustomError({
          localizedMessage: {
            en: 'Organization Not Found',
            ar: 'المنظمة غير موجود',
          },
          event: 'Not_Found',
          errorType: ErrorType.NOT_FOUND,
        }),
      );
    }

    const user = await this.userModel.findOne({ email: body.email });

    if (!user) {
      throw new NotFoundException(
        new CustomError({
          localizedMessage: {
            en: 'User Not Found',
            ar: 'المستحدم غير موجود',
          },
          event: 'Not_Found',
          errorType: ErrorType.NOT_FOUND,
        }),
      );
    }

    organization.memebers.push(user._id);
    await organization.save();
  }
}
