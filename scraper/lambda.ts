import scrapeCampus from './scrapeCampus';
import { S3_BUCKET } from './util';

const campuses = ['unsw'];

export const handler = async () => {
  const promises: Promise<void>[] = [];
  for (let campus of campuses) {
    const promise = scrapeCampus(campus, S3_BUCKET).catch(e => {
      console.error(e + '');
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  return Promise.all(promises);
}
