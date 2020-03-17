import { getCampusScraper } from './scraper';
import { getWriter } from './writer';
import HTMLCache from './scraper/HTMLCache';
import { CampusData, CampusScraper } from './scraper/CampusScraper';

export const scrapeCampus = async (campus: string, outputPrefix: string = '', cacheFile?: string) => {
  const scraper = await getCampusScraper(campus);
  scraper.cache = new HTMLCache();

  if (cacheFile) await scraper.cache.load(cacheFile).catch(() => {});

  const data = await scraper.scrape().catch(() => {});

  if (data) {
    if (cacheFile) await scraper.cache.write(cacheFile);

    for (const term of data) {
      await writeTermData(scraper, outputPrefix, term);

      if (term.current) {
        await writeTermData(scraper, outputPrefix, term, true);
      }
    }
  } else {
    scraper.log('no data written');
  }
}

const writeTermData = async (
  scraper: CampusScraper,
  outputPrefix: string,
  termData: CampusData,
  current?: boolean,
) => {
  const { term, year } = termData.meta;
  let destination: string;
  if (current) {
    destination = `${outputPrefix}${scraper.campus}/data.json`;
  } else {
    destination = `${outputPrefix}${scraper.campus}/data-${year}T${term}.json`;
  }
  const output = getWriter(destination);
  await output.write(termData);
  scraper.log(`written term ${term} to ${output}`);
}

export default scrapeCampus;
