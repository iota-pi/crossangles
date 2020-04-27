import crypto from 'crypto';
import S3 from 'aws-sdk/clients/s3';

const s3 = new S3();

const TIMETABLE_BUCKET = 'crossangles-timetables';

export const saveForDebug = (data: any) => {
  const content = JSON.stringify(data);
  const campus = data.campus || 'unknown';
  return upload(content, campus);
}

const upload = (content: string, campus: string, additionalParams?: Partial<S3.PutObjectRequest>) => {
  const hash = getHash(content);
  return s3.upload({
    Bucket: TIMETABLE_BUCKET,
    Key: `${campus}/${hash}.json`,
    ContentType: 'application/json',
    Body: content,
    ContentMD5: hash,
    ACL: 'public-read',
    ...additionalParams,
  }).promise();
}

// Get base64 digest of md5 hash of content
const getHash = (content: string): string => {
  const buffer = Buffer.from(content);
  const md5 = crypto.createHash('md5').update(buffer);
  return md5.digest('base64').replace(/\//g, '_');
}
