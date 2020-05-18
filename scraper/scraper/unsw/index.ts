import ClassUtilScraper, { CLASSUTIL } from './ClassUtilScraper';
import { generateMetaData } from '../meta';
import { CampusData, Scraper } from '../Scraper';
import { CourseData } from '../../../app/src/state';
import StateManager from '../../state/StateManager';

export const UNSW = 'unsw';
const DATA_THRESHOLD = 0.2;

export async function scrapeUNSW (scraper: Scraper, state: StateManager): Promise<CampusData[]> {
  const terms = [1, 2, 3];

  const classutil = await ClassUtilScraper.create({ scraper, state });
  const classutilPromise = classutil.setup();
  const useClassUtil = await classutilPromise;

  const results: CampusData[] = [];
  for (const term of terms) {
    const sources: string[] = [];

    let classutilData: CourseData[] | null = null;
    if (useClassUtil) {
      classutilData = await scrapeClassUtil(classutil, term);
      if (classutilData) {
        sources.push(CLASSUTIL);
      }
    }

    const courses: CourseData[] = mergeTimetables(
      classutilData,
    );
    const meta = generateMetaData(term, sources);
    results.push({
      campus: UNSW,
      courses,
      meta,
      current: false,
    });
  }

  // Nominate latest stream with sufficient data as being "current"
  let currentTerm: number | null = null;
  for (let i = 0; i < results.length; i++) {
    const courses = results[i].courses;
    const hasStreamData = courses.filter(c => c.streams.length > 0);
    if (hasStreamData.length > courses.length * DATA_THRESHOLD) {
      currentTerm = i;
    }
  }
  if (currentTerm !== null) {
    results[currentTerm].current = true;
  }

  return results;
}

export async function scrapeClassUtil (classutil: ClassUtilScraper, term: number) {
  try {
    return await classutil.scrape(term);
  } catch (error) {
    console.error(`Error while scraping from ${CLASSUTIL} for term ${term}`);
    console.error(error);
  }

  return null;
}

// export async function scrapeTimetable (timetable: TimetableScraper, term: number) {
//   try {
//   } catch (error) {
//     console.error(`Error while scraping from ${TIMETABLE_UNSW} for term ${term}`);
//     console.error(error);
//   }

//   return null;
// }

export function mergeTimetables (classutilData: CourseData[] | null): CourseData[] {
  if (classutilData) {
    return classutilData;
  }

  return [];
}
