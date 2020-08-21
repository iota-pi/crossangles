import { CampusData } from '../Scraper';
import { ScrapeCampusArgs } from '../../scrapeCampus';
import { getLogger } from '../../logging';
import UOSTimetableScraper from './UOSTimetableScraper';
import generateMetaData from '../meta';
import getAdditional from '../../data/additional';
import getAEST from '../../getAEST';
import { getCurrentTerm } from '../../../app/src/state/Meta';

export const USYD = 'usyd';
const logger = getLogger('scrapeUSYD', { campus: USYD });


export async function scrapeUSYD(
  { state, forceUpdate = false }: ScrapeCampusArgs,
): Promise<CampusData[] | null> {
  const year = await UOSTimetableScraper.getLatestYear();
  const timetable = new UOSTimetableScraper({ state, year });
  const rescrapeTimetable = timetable.setup() || forceUpdate;

  // Don't need to update data if only using info from cache
  if (!rescrapeTimetable) {
    return null;
  }

  const timetableData = await timetable.scrape();

  const results: CampusData[] = [];
  const currentTerm = chooseCurrentTerm(year);
  for (let i = 0; i < timetableData.length; ++i) {
    const term = i + 1;
    const meta = generateMetaData(term, [timetable.baseUrl], year);

    logger.info(`Including additional data for term ${term}`);
    const termString = getCurrentTerm(meta);
    const additional = getAdditional(USYD, termString);
    const courses = [...timetableData[i], ...additional];

    results.push({
      campus: USYD,
      courses,
      current: term === currentTerm,
      meta,
    });
  }

  return results;
}

export function chooseCurrentTerm(scrapedYear: number): number {
  const now = getAEST().toDate();

  // Term 1 if we've scraped data for the next year
  const currentYear = now.getFullYear();
  if (scrapedYear > currentYear) {
    return 1;
  }

  // Term 1 for Jan-May
  if (now.getMonth() < 5) {
    return 1;
  }

  // Otherwise, term 2
  return 2;
}
