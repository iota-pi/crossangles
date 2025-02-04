import type { CampusData } from '../Scraper';
import type { CourseData } from '../../../app/src/state/Course';
import { getTermStart } from '../../../app/src/state/Stream';
import { TimetableScraper, TIMETABLE_UNSW } from './TimetableScraper';
import generateMetaData from '../meta';
import { getLogger } from '../../logging';
import getAdditional from '../../data';
import { getCurrentTerm } from '../../../app/src/state/Meta';
import type { ScrapeCampusArgs } from '../../scrapeCampus';

export const UNSW = 'unsw';
const logger = getLogger('scrapeUNSW', { campus: UNSW });
const DATA_THRESHOLD = 0.2;
const TERMS = [1, 2, 3];


export async function scrapeUNSW(
  { state, forceUpdate = false }: ScrapeCampusArgs,
): Promise<CampusData[] | null> {
  const timetable = new TimetableScraper({ state });

  const rescrapeTimetable = await timetable.setup() || forceUpdate;

  // Don't need to update data if only using info from cache
  if (!rescrapeTimetable) {
    return null;
  }

  const timetablePromise = scrapeTimetable(timetable, !rescrapeTimetable);
  const timetableData = await timetablePromise;
  logger.info('Finished scraping for UNSW');

  return splitByTerm(timetableData);
}

export function splitByTerm(
  timetableData: CourseData<string>[][],
): CampusData[] {
  const sources: string[] = [];
  if (timetableData.length) { sources.push(TIMETABLE_UNSW); }

  const results: CampusData[] = [];
  for (let i = 0; i < TERMS.length; ++i) {
    const term = i + 1;
    const termStart = getTermStart(timetableData[i].flatMap(c => c.streams));
    const meta = generateMetaData(term, termStart.toDateString(), sources);

    logger.info(`Including additional data for term ${term}`);
    const termString = getCurrentTerm(meta);
    const additional = getAdditional(UNSW, termString);
    const courses = [...timetableData[i], ...additional];

    results.push({
      campus: UNSW,
      courses,
      current: false,
      meta,
    });
  }

  // Nominate latest stream with sufficient data as being "current"
  logger.info('Picking current term');
  const currentTerm = selectCurrentTerm(results);
  if (currentTerm !== null) {
    results[currentTerm].current = true;
  }
  logger.info(`Current term is ${currentTerm !== null ? currentTerm + 1 : currentTerm}`);

  return results;
}

export async function scrapeTimetable(
  timetable: TimetableScraper,
  useCache: boolean,
): Promise<CourseData[][]> {
  if (useCache) {
    return timetable.getCache();
  }

  try {
    return await timetable.scrape();
  } catch (error) {
    logger.error(`Error while scraping from ${TIMETABLE_UNSW}`, error);
    return [];
  }
}

export function selectCurrentTerm(
  data: CampusData[],
) {
  let currentTerm: number | null = null;
  for (let i = 0; i < data.length; i++) {
    const courses = data[i].courses;
    const hasStreamData = courses.filter(c => c.streams.length > 0);
    logger.info(
      `Term ${i + 1} has stream data for `
      + `${Math.round((hasStreamData.length / courses.length) * 100)}%`
      + ` of ${courses.length} courses.`,
    );
    if (hasStreamData.length > courses.length * DATA_THRESHOLD) {
      currentTerm = i;
    }
  }
  if (currentTerm === null) {
    logger.warn('No term has sufficient data, not selecting a current term');
  }
  return currentTerm;
}
