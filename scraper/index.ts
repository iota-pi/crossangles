import { getCampusScraper } from './scraper';
import { getWriter } from './writer';
import HTMLCache from './scraper/HTMLCache';


const scrapeCampus = async (campus: string, cacheFile?: string) => {
  const scraper = getCampusScraper(campus);
  scraper.cache = new HTMLCache();

  if (cacheFile) await scraper.cache.load(cacheFile).catch(() => {});
  const data = await scraper.scrape();
  if (cacheFile) await scraper.cache.write(cacheFile);

  const output = getWriter(scraper.output);
  await output.write(data);
  scraper.log(`written to ${output}`);
}

const main = async () => {
  const args = process.argv.slice(2);
  const promises: Promise<void>[] = [];
  for (let campus of args) {
    const cacheFile = `./${campus}-snapshot.json`;
    const promise = scrapeCampus(campus, cacheFile).catch(e => {
      console.error(e + '');
      process.exitCode = 1;
    });
    promises.push(promise);
  }

  await Promise.all(promises);
}

main();
