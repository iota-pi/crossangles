import { createHash } from 'crypto';

export const hashData = (data: any) => {
  return createHash('md5').update(JSON.stringify(data)).digest('hex');
}
