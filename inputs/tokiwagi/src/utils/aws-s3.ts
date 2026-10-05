import * as fs from "fs";

import { File } from "formidable";
import AWS from "aws-sdk";

import { serverConfig } from "config";

AWS.config.update({
  accessKeyId: serverConfig.aws.aws_access_key_id,
  secretAccessKey: serverConfig.aws.aws_secret_access_key,
});

abstract class S3Handler {
  constructor(
    protected readonly s3: AWS.S3,
    protected readonly bucket: string
  ) { }

  // Template method: defines the upload algorithm skeleton
  uploadFile(path: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(file.filepath);
      fileStream.on("error", reject);

      const key = this.buildKey(path, file.originalFilename);
      const params = this.buildUploadParams(key, fileStream);

      this.s3.upload(params, (err, data) => {
        // Delete temporary file
        this.deleteLocalFile(file.filepath);
        if (err) {
          reject(err);
        }
        if (data) {
          resolve(data.Location);
        }
      });
    });
  }

  // Template method: defines the remove algorithm skeleton
  removeFile(key: string): Promise<AWS.S3.DeleteObjectOutput> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject({ Bucket: this.bucket, Key: key }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Hook: subclasses may override to customise upload params (e.g. ACL, ContentType)
  protected buildUploadParams(key: string, body: fs.ReadStream): AWS.S3.PutObjectRequest {
    return { ACL: "public-read", Body: body, Key: key, Bucket: this.bucket };
  }

  // Invariant step: derive a timestamped S3 key from the original filename
  private buildKey(path: string, originalFilename: string): string {
    const parts = originalFilename.split(".");
    const ext = parts.length > 1 ? parts[parts.length - 1] : null;
    const name = `${new Date().getTime()}${ext ? `.${ext}` : ""}`;
    return path ? `${path}/${name}` : name;
  }

  // Invariant step: remove temp file written by formidable
  private deleteLocalFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
    });
  }
}

class TenantS3Handler extends S3Handler {
  constructor() {
    super(
      new AWS.S3({ params: { Bucket: serverConfig.aws.s3.bucket } }),
      serverConfig.aws.s3.bucket
    );
  }
}

class CommonS3Handler extends S3Handler {
  constructor() {
    super(
      new AWS.S3({ params: { Bucket: serverConfig.aws.s3.common_bucket } }),
      serverConfig.aws.s3.common_bucket
    );
  }

  getJson<T = unknown>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Bucket: this.bucket, Key: key }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.Body.toString()) as T);
        }
      });
    });
  }
}

const tenantS3 = new TenantS3Handler();
const commonS3 = new CommonS3Handler();

export const uploadFile = (path: string, file: File) => tenantS3.uploadFile(path, file);
export const removeFile = (key: string) => tenantS3.removeFile(key);
export const getS3CommonJson = <T = unknown>(key: string) => commonS3.getJson<T>(key);
