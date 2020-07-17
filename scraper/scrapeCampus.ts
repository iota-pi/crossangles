import { getWriter } from './writer';
import { CampusData, Scraper } from './scraper/Scraper';
import { UNSW, scrapeUNSW } from './scraper/unsw';
import getStateManager from './state/getStateManager';
import HTMLCache from './scraper/HTMLCache';
import { checkVersionChange, updateVersion } from './state/util';

export const scrapeCampus = async (campus: string, outputPrefix: string = '', cacheFile?: string) => {
  let scraper: Scraper | undefined = undefined;
  let cache: HTMLCache | undefined = undefined;
  if (cacheFile) {
    scraper = new Scraper();
    cache = scraper.cache;
    await cache.load(cacheFile).catch(() => {});
  }
  const state = getStateManager();

  let forceUpdate = false;
  if (await checkVersionChange(state)) {
    updateVersion(state);
    forceUpdate = true;
  }

  let data: CampusData[] | null = null;
  switch (campus) {
    case UNSW:
      data = await scrapeUNSW({ scraper, state, forceUpdate });
  }

  if (data) {
    if (cache && cacheFile) {
      await cache.write(cacheFile);
    }

    for (const term of data) {
      await writeTermData(outputPrefix, term);

      if (term.current) {
        await writeTermData(outputPrefix, term, true);
      }
    }
  } else {
    console.log(`${UNSW}: no data written`);
  }
}

const writeTermData = async (
  outputPrefix: string,
  termData: CampusData,
  current?: boolean,
) => {
  const { term, year } = termData.meta;
  let destination: string;
  if (current) {
    destination = `${outputPrefix}${UNSW}/data.json`;
  } else {
    destination = `${outputPrefix}${UNSW}/data-${year}T${term}.json`;
  }
  const output = getWriter(destination);
  await output.write(termData);
  console.log(`${UNSW.toUpperCase()}: data written for term ${term}`);
}

export default scrapeCampus;
