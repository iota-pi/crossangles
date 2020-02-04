require('dotenv').config();

import { getCampusCrawler } from './campus';
import { getWriter } from './output';

const crawlCampus = async (campus: string) => {
  const crawler = getCampusCrawler(campus);
  const output = getWriter(crawler.output);
  const data = await crawler.crawl();
  output.write(data);
  crawler.log(`written to ${output}`);
}

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (let campus of args) {
    const promise = crawlCampus(campus).catch(e => {
      console.error(e + '');
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  for (const promise of promises) {
    await promise;
  }
}

main();
