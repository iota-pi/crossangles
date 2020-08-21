import { getWriter } from './writer';
import { CampusData, Scraper } from './scraper/Scraper';
import { UNSW, scrapeUNSW } from './scraper/unsw/scrapeUNSW';
import { USYD, scrapeUSYD } from './scraper/usyd/scrapeUSYD';
import getStateManager from './state/getStateManager';
import HTMLCache from './scraper/HTMLCache';
import { checkVersionChange, updateVersion } from './state/util';
import { getLogger } from './logging';
import CampusError from './scraper/CampusError';
import StateManager from './state/StateManager';

const logger = getLogger('scrapeCampus');

export interface ScrapeCampusArgs {
  scraper?: Scraper,
  state?: StateManager | null,
  forceUpdate?: boolean,
}

async function scrapeCampus(
  campus: string,
  outputPrefix: string = '',
  cacheFile?: string,
  useState = true,
) {
  let scraper: Scraper | undefined;
  let cache: HTMLCache | undefined;
  if (cacheFile) {
    scraper = new Scraper();
    cache = scraper.cache;
    await cache.load(cacheFile).catch(() => {});
  }
  const state = useState ? getStateManager() : null;

  let forceUpdate = !useState;
  if (state && await checkVersionChange(state)) {
    updateVersion(state);
    forceUpdate = true;
    logger.info('Scraper code updated, forcing data update.');
  }

  let data: CampusData[] | null = null;
  switch (campus) {
    case UNSW:
      data = await scrapeUNSW({ scraper, state, forceUpdate });
      break;
    case USYD:
      data = await scrapeUSYD({ scraper, state, forceUpdate });
      break;
    default:
      throw new CampusError(`Unhandled campus ${campus}`);
  }

  if (data) {
    if (cache && cacheFile) {
      logger.info('Writing data to cache file');
      await cache.write(cacheFile);
    }

    const writeDataPromises: Promise<void>[] = [];
    for (const term of data) {
      logger.info(`Writing term ${term} data`);
      writeDataPromises.push(writeTermData(outputPrefix, term));

      if (term.current) {
        logger.info(`Writing current data (term ${term})`);
        writeDataPromises.push(writeTermData(outputPrefix, term, true));
      }
    }
    await Promise.all(writeDataPromises);
  } else {
    logger.info(`${UNSW}: no data written`);
  }
}

async function writeTermData(
  outputPrefix: string,
  termData: CampusData,
  current?: boolean,
) {
  const { term, year } = termData.meta;
  let destination: string;
  if (current) {
    destination = `${outputPrefix}${UNSW}/data.json`;
  } else {
    destination = `${outputPrefix}${UNSW}/data-${year}T${term}.json`;
  }
  const output = getWriter(destination);
  const size = await output.write(termData);
  logger.info(`data written for term ${term}`, { dataFileSize: size });
}

export default scrapeCampus;
