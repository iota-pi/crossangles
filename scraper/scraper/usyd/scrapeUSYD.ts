import { CampusData } from '../Scraper';
import { ScrapeCampusArgs } from '../../scrapeCampus';
import { getLogger } from '../../logging';
import UOSTimetableScraper from './UOSTimetableScraper';

export const USYD = 'usyd';
const logger = getLogger('scrapeUSYD', { campus: USYD });


export async function scrapeUSYD(
  { scraper, state, forceUpdate = false }: ScrapeCampusArgs,
): Promise<CampusData[] | null> {
  const year = await UOSTimetableScraper.getLatestYear();
  const timetable = new UOSTimetableScraper({ scraper, state, year });
  const rescrapeTimetable = timetable.setup() || forceUpdate;

  // Don't need to update data if only using info from cache
  if (!rescrapeTimetable) {
    return null;
  }

  return null;
}
