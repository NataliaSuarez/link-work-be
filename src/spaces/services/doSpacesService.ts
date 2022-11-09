import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import { DOSpacesServiceLib } from '.';

const linkWorkBucket =
  process.env.DO_SPACES_USER_MEDIA_BUCKET ?? 'linkwork-user-media-dev';

@Injectable()
export class DOSpacesService {
  constructor(@Inject(DOSpacesServiceLib) private readonly s3: AWS.S3) {}

  parseS3Url(url: string): { bucket: string; key: string } {
    const bucket = url.split('.')[0].split('//').pop();
    const key = url.split('/').slice(3).join('/');
    return { bucket, key };
  }

  private async uploadFile(
    data: Buffer | fs.ReadStream,
    bucket: string,
    key: string,
    options?: { contentType?: string; acl?: string },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Bucket: bucket,
          Key: key,
          ContentType: options?.contentType,
          Body: data,
          ACL: options?.acl ?? 'private',
        },
        (error: AWS.AWSError) => {
          if (!error) {
            resolve(
              `https://${bucket}.${process.env.DO_SPACES_ENDPOINT}/${key}`,
            );
          } else {
            reject(
              new Error(
                `DOSpacesService_ERROR: ${
                  error.message ||
                  error.code ||
                  'Something went wrong while uploading the file'
                }`,
              ),
            );
          }
        },
      );
    });
  }

  async uploadOfferVideo(
    file: Express.Multer.File,
    employerUserId: string,
    offerId: string,
  ): Promise<string> {
    const key = `video/offers/employer-${employerUserId}/offer-${offerId}`;
    const fileReadStream = fs.createReadStream(file.path);
    return await this.uploadFile(fileReadStream, linkWorkBucket, key, {
      contentType: file.mimetype,
    });
  }

  async uploadWorkerVideo(
    file: Express.Multer.File,
    workerUserId: string,
  ): Promise<string> {
    const key = `video/workers/worker-${workerUserId}`;
    const fileReadStream = fs.createReadStream(file.path);
    return await this.uploadFile(fileReadStream, linkWorkBucket, key, {
      contentType: file.mimetype,
    });
  }

  async uploadProfileImg(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    const key = `img/profiles/user-${userId}`;
    const fileReadStream = fs.createReadStream(file.path);
    return await this.uploadFile(fileReadStream, linkWorkBucket, key, {
      contentType: file.mimetype,
    });
  }

  async uploadBusinessImg(
    file: Express.Multer.File,
    employerUserId: string,
  ): Promise<string> {
    const randomKey = Math.random().toString(36).slice(2, 7);
    const key = `img/employers/employer-${employerUserId}/${randomKey}`;
    const fileReadStream = fs.createReadStream(file.path);
    return await this.uploadFile(fileReadStream, linkWorkBucket, key, {
      contentType: file.mimetype,
    });
  }

  async tempAccessToPrivateFileUrl(
    url: string,
    expires?: number,
  ): Promise<string> {
    const { bucket, key } = this.parseS3Url(url);
    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl(
        'getObject',
        {
          Bucket: bucket,
          Key: key,
          Expires: expires ?? 300, // Default 5 minutes
        },
        (error: AWS.AWSError, url: string) => {
          if (!error) {
            resolve(url);
          } else {
            reject(
              new Error(
                `DOSpacesService_ERROR: ${
                  error.message ||
                  error.code ||
                  'Something went wrong while getting the signed url'
                }`,
              ),
            );
          }
        },
      );
    });
  }

  async downloadFile(url: string): Promise<AWS.S3.GetObjectOutput> {
    const { bucket, key } = this.parseS3Url(url);
    return new Promise((resolve, reject) => {
      this.s3.getObject(
        {
          Bucket: bucket,
          Key: key,
        },
        (error: AWS.AWSError, data: AWS.S3.GetObjectOutput) => {
          if (!error) {
            resolve(data);
          } else {
            reject(
              new Error(
                `DOSpacesService_ERROR: ${
                  error.message ||
                  error.code ||
                  'Something went wrong while downloading the file'
                }`,
              ),
            );
          }
        },
      );
    });
  }

  async deleteFile(url: string): Promise<boolean> {
    const { bucket, key } = this.parseS3Url(url);
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: bucket,
          Key: key,
        },
        (error: AWS.AWSError) => {
          if (!error) {
            resolve(true);
          } else {
            reject(
              new Error(
                `DOSpacesService_ERROR: ${
                  error.message ||
                  error.code ||
                  'Something went wrong while deleting an object'
                }`,
              ),
            );
          }
        },
      );
    });
  }

  private async deleteFolder(
    bucket: string,
    folderPath: string,
    maxKeys?: number,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // get all keys and delete objects
      const getAndDelete = (ct: string = null) => {
        this.s3
          .listObjectsV2({
            Bucket: bucket,
            MaxKeys: maxKeys ?? 1000,
            ContinuationToken: ct,
            Prefix: `${folderPath}/`,
            Delimiter: '',
          })
          .promise()
          .then(async (data) => {
            // params for delete operation
            const params = {
              Bucket: bucket,
              Delete: { Objects: [] },
            };
            // add keys to Delete Object
            data.Contents.forEach((content) => {
              params.Delete.Objects.push({ Key: content.Key });
            });
            // delete all keys
            await this.s3.deleteObjects(params).promise();
            // check if ct is present
            if (data.NextContinuationToken)
              getAndDelete(data.NextContinuationToken);
            else resolve(true);
          })
          .catch((error: AWS.AWSError) =>
            reject(
              new Error(
                `DOSpacesService_ERROR: ${
                  error.message ||
                  error.code ||
                  'Something went wrong while deleting the folder'
                }`,
              ),
            ),
          );
      };

      getAndDelete();
    });
  }
}
