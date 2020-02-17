import { getCampusScraper } from './scraper';
import { getWriter } from './writer';
import HTMLCache from './scraper/HTMLCache';

export const scrapeCampus = async (campus: string, outputPrefix?: string, cacheFile?: string) => {
  const scraper = getCampusScraper(campus);
  scraper.cache = new HTMLCache();

  if (cacheFile) await scraper.cache.load(cacheFile).catch(() => {});
  const data = await scraper.scrape();
  if (cacheFile) await scraper.cache.write(cacheFile);

  const destination = (outputPrefix || '') + scraper.output;
  const output = getWriter(destination);
  await output.write(data);
  scraper.log(`written to ${output}`);
}

export default scrapeCampus;
