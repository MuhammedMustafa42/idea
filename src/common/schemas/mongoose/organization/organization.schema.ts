import { ModelNames } from '@common/constants';
import { Connection, Schema } from 'mongoose';
import { validateSchema } from 'src/common/helpers';
import { IOrganizationModel, Organization } from './organization.type';

export const OrganizationSchema = new Schema<Organization, IOrganizationModel>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    memebers: {
      type: [Schema.Types.ObjectId],
      required: false,
      ref: ModelNames.USER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  },
);

export function organizationSchemaFactory(connection: Connection) {
  OrganizationSchema.index({ name: 1 });

  OrganizationSchema.pre('validate', async function () {
    await validateSchema(this, Organization);
  });

  OrganizationSchema.pre('save', async function () {
    this.name = this.name.toLowerCase();
  });

  const organizationModel = connection.model(
    ModelNames.ORGANIZATION,
    OrganizationSchema,
  );

  return organizationModel;
}
