import ClassUtilScraper, { CLASSUTIL } from './ClassUtilScraper';
import { CampusData, Scraper } from '../Scraper';
import { CourseData, CourseMap, getCourseId } from '../../../app/src/state/Course';
import { getStreamId } from '../../../app/src/state/Stream';
import StateManager from '../../state/StateManager';
import { TimetableScraper, TIMETABLE_UNSW } from './TimetableScraper';
import { generateMetaData } from '../meta';

export const UNSW = 'unsw';
const DATA_THRESHOLD = 0.2;
const terms = [1, 2, 3];

export async function scrapeUNSW (scraper: Scraper, state: StateManager): Promise<CampusData[]> {
  const classutil = new ClassUtilScraper({ scraper, state });
  const classutilPromise = classutil.setup();

  const timetable = new TimetableScraper({ scraper, state });
  const timetablePromise = timetable.setup();

  const useClassUtil = await classutilPromise;
  const useTimetable = await timetablePromise;

  let classutilData: CourseData[][] = [];
  for (const term of terms) {
    if (useClassUtil) {
      try {
        classutilData.push(await classutil.scrape(term));
      } catch (error) {
        console.error(`Error while scraping from ${CLASSUTIL} for term ${term}`);
        console.error(error);
      }
    }
  }

  let timetableData: CourseData[][] = [];
  if (useTimetable) {
    try {
      timetableData = await timetable.scrape();
    } catch (error) {
      console.error(`Error while scraping from ${TIMETABLE_UNSW}`);
      console.error(error);
    }
  }

  const sources: string[] = [];
  if (classutilData.length) { sources.push(CLASSUTIL); }
  if (timetableData.length) { sources.push(TIMETABLE_UNSW); }

  const results: CampusData[] = [];
  for (const term of terms) {
    mergeData(classutilData[term], timetableData[term]);
    results.push({
      campus: UNSW,
      courses: classutilData[term],
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
    throw new Error('Received no course data');
  }

  const timetableCourseMap: CourseMap = {};
  for (const course of timetableData) {
    timetableCourseMap[getCourseId(course)] = course;
  }

  for (const course of classutilData) {
    const courseId = getCourseId(course);
    const timetableCourse = timetableCourseMap[courseId];

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
