import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  MONGO_INITDB_ROOT_USERNAME: Joi.string().required(),
  MONGO_INITDB_ROOT_PASSWORD: Joi.string().required(),
  MONGO_DB: Joi.string().required(),
  MONGO_PORT: Joi.number().required(),
  MONGO_HOST: Joi.string().required(),
  MONGO_CONNECTION: Joi.string().required(),
  MONGO_URI: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_SECRET: Joi.string().required(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  DO_SPACES_ENDPOINT: Joi.string().required(),
  DO_SPACES_KEY: Joi.string().required(),
  DO_SPACES_SECRET: Joi.string().required(),
  DO_SPACES_USER_MEDIA_BUCKET: Joi.string().required(),
});
