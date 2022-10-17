// index.ts
import * as AWS from 'aws-sdk';
import { Provider } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

export const DOSpacesServiceLib = 'lib:do-spaces-service';

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);

const S3 = new AWS.S3({
  endpoint: spacesEndpoint.href,
  credentials: new AWS.Credentials({
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  }),
});

export const DOSpacesServiceProvider: Provider<AWS.S3> = {
  provide: DOSpacesServiceLib,
  useValue: S3,
};
