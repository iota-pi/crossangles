import ClassUtilScraper, { CLASSUTIL } from './ClassUtilScraper';
import { CampusData, Scraper } from '../Scraper';
import { CourseData, CourseMap, getCourseId } from '../../../app/src/state/Course';
import { getStreamId, StreamData } from '../../../app/src/state/Stream';
import StateManager from '../../state/StateManager';
import { TimetableScraper, TIMETABLE_UNSW } from './TimetableScraper';
import { generateMetaData } from '../meta';
import { getLogger } from '../../logging';

const logger = getLogger('scrapeUNSW', { campus: 'unsw' });

export const UNSW = 'unsw';
const DATA_THRESHOLD = 0.2;
const terms = [1, 2, 3];

export async function scrapeUNSW (
  { scraper, state, forceUpdate = false }: { scraper?: Scraper, state?: StateManager | null, forceUpdate?: boolean }
): Promise<CampusData[] | null> {
  const classutil = new ClassUtilScraper({ scraper, state });
  const timetable = new TimetableScraper({ scraper, state });

  const rescrapeClassUtil = await classutil.setup() || forceUpdate;
  const rescrapeTimetable = await timetable.setup() || forceUpdate;

  // Don't need to update data if only using info from cache
  if (!rescrapeClassUtil && !rescrapeTimetable) {
    return null;
  }

  const classutilPromise = scrapeClassUtil(classutil, !rescrapeClassUtil);
  const timetablePromise = scrapeTimetable(timetable, !rescrapeTimetable);
  const classutilData = await classutilPromise;
  const timetableData = await timetablePromise;
  logger.info('Finished scraping for UNSW');

  const sources: string[] = [];
  if (classutilData.length) { sources.push(CLASSUTIL); }
  if (timetableData.length) { sources.push(TIMETABLE_UNSW); }

  const results: CampusData[] = [];
  for (let i = 0; i < terms.length; ++i) {
    const term = i + 1;
    logger.info(`Merging data for term ${term}`);
    const mergedData = mergeData(classutilData[i], timetableData[i]);
    results.push({
      campus: UNSW,
      courses: mergedData,
      meta: generateMetaData(term, sources),
      current: false,
    });
  }

  // Nominate latest stream with sufficient data as being "current"
  logger.info('Picking current term');
  const currentTerm = getCurrentTerm(results);
  if (currentTerm !== null) {
    results[currentTerm].current = true;
  }
  logger.info(`Current term is ${currentTerm}`);

  return results;
}

export function mergeData (classutilData?: CourseData[], timetableData?: CourseData[]) {
  // Just use data from one if the other has no data
  if (!classutilData || !timetableData) {
    if (timetableData) {
      logger.warn('No data from classutil, using timetable data only');
      return timetableData;
    } else if (classutilData) {
      logger.warn('No data from timetable, using classutil data only');
      return classutilData;
    } else {
      logger.warn('No data from classutil or timetable!');
      return [];
    }
  }

  const timetableCourseMap: CourseMap = {};
  for (const course of timetableData) {
    const courseId = getCourseId(course, true);
    timetableCourseMap[courseId] = course;
  }

  for (const course of classutilData) {
    const simpleCourseId = getCourseId(course, true);
    const timetableCourse = timetableCourseMap[simpleCourseId];
    if (timetableCourse === undefined) {
      continue;
    }

    // ClassUtil abbreviates long names
    course.name = timetableCourse.name;

    // ClassUtil doesn't include descriptions for courses
    if (timetableCourse.description) {
      course.description = timetableCourse.description;
    }

    const enrolmentStreams = filterEnrolmentStreams(timetableCourse.streams);
    if (enrolmentStreams.length > 1) {
      // Find corresponding course enrolment stream and update the course's description
      const enrolment = timetableCourse.streams.find(s => s.component === course.section);
      if (enrolment) {
        course.description = enrolment.notes;
      }
    } else {
      // No need to include section if there only is one section for the course
      course.section = undefined;
    }

    if (timetableCourse !== undefined) {
      for (const stream of course.streams) {
        const timetableStream = timetableCourse.streams.find(
          s => getStreamId(timetableCourse, s, true) === getStreamId(course, stream, true)
        );

        if (stream.times && timetableStream && timetableStream.times) {
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

export function filterEnrolmentStreams (streams: StreamData[]) {
  const regex = /^CR(?:[0-9]{2}|S)$/;
  return streams.filter(s => regex.test(s.component));
}

export async function scrapeClassUtil (classutil: ClassUtilScraper, useCache: boolean): Promise<CourseData[][]> {
  let classutilData: CourseData[][] = [];
  for (const term of terms) {
    if (useCache) {
      classutilData.push(await classutil.getCache(term));
    } else {
      try {
        classutilData.push(await classutil.scrape(term));
      } catch (error) {
        logger.error(`Error while scraping from ${CLASSUTIL} for term ${term}`, error);
      }
    }
  }
  return classutilData;
}

export async function scrapeTimetable (timetable: TimetableScraper, useCache: boolean): Promise<CourseData[][]> {
  if (useCache) {
    return await timetable.getCache();
  } else {
    try {
      return await timetable.scrape();
    } catch (error) {
      logger.error(`Error while scraping from ${TIMETABLE_UNSW}`, error);
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
