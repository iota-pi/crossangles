import scrapeCampus from './scrapeCampus';

const bucket_name = process.env.S3_OUTPUT_BUCKET || 'crossangles-course-data';
const bucket = `s3://${bucket_name}/`;
const campuses = ['unsw'];

export const handler = async () => {
  const promises: Promise<void>[] = [];
  for (let campus of campuses) {
    const promise = scrapeCampus(campus, bucket).catch(e => {
      console.error(e + '');
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  return Promise.all(promises);
}
