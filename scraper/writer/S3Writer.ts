import { Writer } from './Writer';
import S3 from 'aws-sdk/clients/s3';
import crypto from 'crypto';


export class S3Writer implements Writer {
  private readonly s3 = new S3();

  constructor (
    private readonly bucket: string,
    private readonly path: string,
  ) {}

  async write (data: any, createBackup = false) {
    const json = JSON.stringify(data);

    await this.upload(json);

    if (createBackup) {
      await this.createBackup(json);
    }
  }

  async read () {
    const result = await this.getObject();
    const content = result.Body?.toString('utf-8');
    if (content) {
      return JSON.parse(content);
    }

    return undefined;
  }

  toString () {
    const paramsString = `{ bucket: "${this.bucket}", path: "${this.path}" }`;
    return `<S3Writer ${paramsString}>`;
  }

  private createBackup (content: string) {
    const key = this.path;
    return this.upload(content, { Key: key, Tagging: 'data-type=backup' });
  }

  private upload (content: string, additionalParams?: Partial<S3.PutObjectRequest>) {
    return this.s3.upload({
      Bucket: this.bucket,
      Key: this.path,
      ContentType: 'application/json',
      Body: content,
      ContentMD5: this.getHash(content),
      ACL: 'public-read',
      ...additionalParams,
    }).promise();
  }

  private getObject () {
    return this.s3.getObject({
      Bucket: this.bucket,
      Key: this.path,
    }).promise();
  }

  // Get base64 digest of md5 hash of content
  private getHash (content: string): string {
    const buffer = Buffer.from(content);
    const md5 = crypto.createHash('md5').update(buffer);
    return md5.digest('base64');
  }
}

export default S3Writer;
