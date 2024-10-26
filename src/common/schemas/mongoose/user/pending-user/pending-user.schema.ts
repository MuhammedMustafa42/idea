import { ModelNames } from '@common/constants';
import * as bcrypt from 'bcrypt';
import { Connection, Schema } from 'mongoose';
import { validateSchema } from 'src/common/helpers';
import { UserSchema } from '../user.schema';
import {
  IPendingUserInstanceMethods,
  IPendingUserModel,
  PendingUser,
} from './pending-user.type';

const { email, password } = UserSchema.obj;

const PendingUserSchema = new Schema<
  PendingUser,
  IPendingUserModel,
  IPendingUserInstanceMethods
>(
  {
    email,

    password,

    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export function pendingUserSchemaFactory(connection: Connection) {
  PendingUserSchema.index({ email: 1 });
  PendingUserSchema.index({ username: 1 });

  PendingUserSchema.pre('validate', async function () {
    await validateSchema(this, PendingUser);
  });

  PendingUserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  PendingUserSchema.pre('save', async function () {
    this.email = this.email.toLowerCase();
    this.name = this.name.toLowerCase();
  });

  const pendingUserModel = connection.model(
    ModelNames.PENDING_USER,
    PendingUserSchema,
  );

  return pendingUserModel;
}
