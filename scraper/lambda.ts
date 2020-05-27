import scrapeCampus from './scrapeCampus';

const campuses = ['unsw'];
const bucket_name = process.env.S3_OUTPUT_BUCKET || 'crossangles-course-data';
export const S3_BUCKET = `s3://${bucket_name}/`;

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
