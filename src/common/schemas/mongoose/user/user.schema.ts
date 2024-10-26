import * as bcrypt from 'bcrypt';
import { Connection, HydratedDocument, Schema } from 'mongoose';
import { ModelNames } from '@common/constants';
import { validateSchema } from 'src/common/helpers';
import { IUserInstanceMethods, IUserModel, User } from './user.type';

export const UserSchema = new Schema<User, IUserModel, IUserInstanceMethods>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

export function userSchemaFactory(connection: Connection) {
  UserSchema.index({ email: 1 });
  UserSchema.index({ name: 1 });

  UserSchema.pre('validate', async function () {
    await validateSchema(this, User);
  });

  UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  UserSchema.pre('save', async function () {
    this.email = this.email.toLowerCase();
    this.name = this.name.toLowerCase();
  });

  UserSchema.methods.comparePassword = async function (
    this: HydratedDocument<User>,
    password: string,
  ) {
    return bcrypt.compare(password, this.password);
  };

  const userModel = connection.model(ModelNames.USER, UserSchema);

  return userModel;
}
