import ClassUtilScraper, { CLASSUTIL } from './ClassUtilScraper';
import { CampusData, Scraper } from '../Scraper';
import { CourseData, CourseMap, getCourseId } from '../../../app/src/state/Course';
import { getStreamId } from '../../../app/src/state/Stream';
import StateManager from '../../state/StateManager';
import { TimetableScraper, TIMETABLE_UNSW } from './TimetableScraper';
import { generateMetaData } from '../meta';
import { getWriter } from '../../writer';
import { S3_BUCKET } from '../../util';

export const UNSW = 'unsw';
const DATA_THRESHOLD = 0.2;
const terms = [1, 2, 3];
const forceUpdate = !!process.env.FORCE || process.env.NODE_ENV === 'test';

export async function scrapeUNSW (
  { scraper, state }: { scraper?: Scraper, state?: StateManager }
): Promise<CampusData[]> {
  const classutil = new ClassUtilScraper({ scraper, state });
  const timetable = new TimetableScraper({ scraper, state });

  const classutilPromise = scrapeClassUtil(classutil);
  const timetablePromise = scrapeTimetable(timetable);
  const classutilData = await classutilPromise;
  const timetableData = await timetablePromise;

  const sources: string[] = [];
  if (classutilData.length) { sources.push(CLASSUTIL); }
  if (timetableData.length) { sources.push(TIMETABLE_UNSW); }

  const results: CampusData[] = [];
  for (let i = 0; i < terms.length; ++i) {
    const mergedData = mergeData(classutilData[i], timetableData[i]);
    const term = i + 1;
    results.push({
      campus: UNSW,
      courses: mergedData,
      meta: generateMetaData(term, sources),
      current: false,
    });
  }

  // Nominate latest stream with sufficient data as being "current"
  const currentTerm = getCurrentTerm(results);
  if (currentTerm !== null) {
    results[currentTerm].current = true;
  }

  return results;
}

export function mergeData (classutilData?: CourseData[], timetableData?: CourseData[]) {
  // Just use data from one if the other has no data
  if (!classutilData || !timetableData) {
    const data = classutilData || timetableData;
    if (data) {
      return data;
    }
    return [];
  }

  const timetableCourseMap: CourseMap = {};
  for (const course of timetableData) {
    timetableCourseMap[getCourseId(course)] = course;
  }

  for (const course of classutilData) {
    const courseId = getCourseId(course);
    const timetableCourse = timetableCourseMap[courseId];
    if (timetableCourse === undefined) {
      continue;
    }

    // ClassUtil abbreviates long names
    course.name = timetableCourse.name;

    if (timetableCourse !== undefined) {
      for (const stream of course.streams) {
        const timetableStream = timetableCourse.streams.find(
          s => getStreamId(timetableCourse, s) === getStreamId(course, stream)
        );

        if (stream.times !== null && timetableStream && timetableStream.times) {
          for (const time of stream.times) {
            const timetableTime = timetableStream.times.find(
              t => t.time === time.time
            );

            if (timetableTime) {
              // ClassUtil abbreviates location names
              time.location = timetableTime.location;
            }
          }
        }
      }
    }
  }

  return classutilData;
}

export async function scrapeClassUtil (classutil: ClassUtilScraper) {
  let classutilData: CourseData[][] = [];
  const cache = getWriter(`${S3_BUCKET}${UNSW}/classutil.json`);
  const useClassUtil = await classutil.setup() || forceUpdate;
  if (useClassUtil) {
    for (const term of terms) {
      try {
        classutilData.push(await classutil.scrape(term));
      } catch (error) {
        console.error(`Error while scraping from ${CLASSUTIL} for term ${term}`);
        console.error(error);
      }
    }

    // Write to cache
    await cache.write(classutilData);
  } else {
    // Read last info from cache
    try {
      classutilData = await cache.read() || [];
    } catch (error) {
      classutilData = [];
    }
  }
  return classutilData;
}

export async function scrapeTimetable (timetable: TimetableScraper) {
  const cache = getWriter(`${S3_BUCKET}${UNSW}/timetable.json`);
  const useTimetable = await timetable.setup() || forceUpdate;
  if (useTimetable) {
    try {
      const data = await timetable.scrape();
      await cache.write(data);
      return data;
    } catch (error) {
      console.error(`Error while scraping from ${TIMETABLE_UNSW}`);
      console.error(error);
    }
  }
  return [];
}

export function getCurrentTerm (data: CampusData[]) {
  let currentTerm: number | null = null;
  for (let i = 0; i < data.length; i++) {
    const courses = data[i].courses;
    const hasStreamData = courses.filter(c => c.streams.length > 0);
    if (hasStreamData.length > courses.length * DATA_THRESHOLD) {
      currentTerm = i;
    }
  }
  return currentTerm;
}
