import {
  S3Client,
  PutObjectCommand,
  PutObjectRequest,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { Writer } from './Writer'

const ENVIRONMENT = process.env.ENVIRONMENT || ''

export class S3Writer implements Writer {
  private readonly s3 = new S3Client()

  constructor(
    private readonly bucket: string,
    private readonly path: string,
  ) {}

  async write(data: any, createBackup = false) {
    const json = JSON.stringify(data)

    await this.upload(json)

    if (createBackup) {
      await this.createBackup(json)
    }

    return json.length
  }

  async read() {
    const result = await this.getObject()
    const content = await result.Body?.transformToString('utf-8')
    if (content) {
      return JSON.parse(content)
    }

    return undefined
  }

  toString() {
    const paramsString = `{ bucket: "${this.bucket}", path: "${this.path}" }`
    return `<S3Writer ${paramsString}>`
  }

  private createBackup(content: string) {
    const key = this.path
    return this.upload(content, { Key: key, Tagging: 'data-type=backup' })
  }

  private upload(content: string, additionalParams?: Partial<PutObjectRequest>) {
    const maxAge = ENVIRONMENT === 'staging' ? 600 : 7200
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.path,
      ContentType: 'application/json',
      Body: content,
      ContentMD5: this.getHash(content),
      CacheControl: `max-age=${maxAge}`,
      ...additionalParams,
    })
    return this.s3.send(command)
  }

  private getObject() {
    return this.s3.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: this.path,
    }))
  }

  // Get base64 digest of md5 hash of content
  private getHash(content: string): string {
    const buffer = Buffer.from(content)
    const md5 = crypto.createHash('md5').update(buffer)
    return md5.digest('base64')
  }
}

export default S3Writer
