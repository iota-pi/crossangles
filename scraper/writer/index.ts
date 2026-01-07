import { Writer } from './Writer'
import { S3Writer } from './S3Writer'
import { FileWriter } from './FileWriter'

export function getWriter(destination: string): Writer {
  if (destination.startsWith('s3://')) {
    const bucketAndPath = destination.slice(5)
    const [bucket, ...pathParts] = bucketAndPath.split('/')
    const path = pathParts.join('/')
    return new S3Writer(bucket, path)
  }

  return new FileWriter(destination)
}

export default getWriter
