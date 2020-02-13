import Writer from './Writer';
import FileWriter from './FileWriter'
import S3Writer from './S3Writer';

export const getWriter = (destination: string): Writer => {
  if (destination.startsWith('s3://')) {
    const bucketAndPath = destination.slice(5)
    const [ bucket, path ] = bucketAndPath.split('/', 2);
    return new S3Writer(bucket, path);
  }

  return new FileWriter(destination);
}
