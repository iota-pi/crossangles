import scrapeCampus from './scrapeCampus';
import code_version from './version';
import { getLogger } from './logging';
import { UNSW } from './scraper/unsw/scrapeUNSW';
import { USYD } from './scraper/usyd/scrapeUSYD';

const campuses = [UNSW, USYD];
const bucketName = process.env.S3_OUTPUT_BUCKET || 'crossangles-course-data';
export const S3_BUCKET = `s3://${bucketName}/`;

const logger = getLogger('LambdaEntry');

export const handler = async () => {
  logger.info(`Scraper invoked with code version: ${code_version}`);
  const promises: Promise<void>[] = [];
  for (const campus of campuses) {
    const promise = scrapeCampus(campus, S3_BUCKET).catch(e => {
      logger.error(`Error while scraping ${campus.toUpperCase()} campus`, e);
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  return Promise.all(promises);
};
