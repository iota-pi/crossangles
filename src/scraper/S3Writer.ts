import { CampusData } from './CampusScraper';
import { Writer } from './Writer';
import S3 from 'aws-sdk/clients/s3';
import crypto from 'crypto';


export class S3Writer implements Writer {
  private readonly s3 = new S3();

  constructor (
    private readonly bucket: string,
    private readonly path: string,
  ) {}

  async write (data: CampusData, createBackup = true) {
    const json = JSON.stringify(data);

    this.putObject(json);

    if (createBackup) {
      this.createBackup(json);
    }
  }

  toString () {
    const paramsString = `{ bucket: "${this.bucket}", path: "${this.path}" }`;
    return `<S3Writer ${paramsString}>`;
  }

  private createBackup (content: string) {
    this.putObject(content, { Tagging: 'data-type=backup' });
  }

  private putObject (content: string, additionalParams?: Partial<S3.PutObjectRequest>) {
    return this.s3.putObject({
      Bucket: this.bucket,
      Key: this.path,
      ContentType: 'application/json',
      Body: content,
      ContentMD5: this.getHash(content),
      ...additionalParams,
    });
  }

  // Get base64 digest of md5 hash of content
  private getHash (content: string): string {
    const buffer = Buffer.from(content);
    const md5 = crypto.createHash('md5').update(buffer);
    return md5.digest('base64');
  }
}

export default S3Writer;
