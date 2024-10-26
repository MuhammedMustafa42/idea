import * as Joi from 'joi';

export const configSchema = () => {
  return Joi.object({
    NODE_ENV: Joi.string().required(),

    MONGODB_URL: Joi.string().required(),

    USER_JWT_SECRET: Joi.string().required(),
    USER_JWT_REFRESH_SECRET: Joi.string().required(),
    USER_JWT_EXPIRY: Joi.number().required(),
    USER_JWT_REFRESH_EXPIRY: Joi.string().required(),

    REDIS_HOST: Joi.string().optional().default('localhost'),
    REDIS_PORT: Joi.number().optional().default(6379),
  });
};
