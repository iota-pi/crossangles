import scrapeCampus from "./scrapeCampus";

const bucket = 's3://crossangles-course-data/';
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
