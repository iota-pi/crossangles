import { getCampusScraper } from './scraper';
import { getWriter } from './writer';

const scrapeCampus = async (campus: string) => {
  const scraper = getCampusScraper(campus);
  const output = getWriter(scraper.output);
  const data = await scraper.scrape();
  output.write(data);
  scraper.log(`written to ${output}`);
}

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (let campus of args) {
    const promise = scrapeCampus(campus).catch(e => {
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
