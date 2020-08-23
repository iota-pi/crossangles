import cheerio from 'cheerio';
import { Scraper } from '../Scraper';
import { CourseData } from '../../../app/src/state/Course';
import StateManager from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import { getLogger } from '../../logging';
import getAEST from '../../getAEST';
import { USYD } from './scrapeUSYD';
import { StreamData, ClassTime } from '../../../app/src/state/Stream';
import { abbreviateDay } from '../unsw/TimetableScraper';
import { removeDuplicateStreams } from '../commonUtils';

const logger = getLogger('UOSTimetableScraper', { campus: USYD });


export interface UOSTimetableScraperConfig {
  state?: StateManager | null,
  year?: number,
}

export interface CoursePage {
  code: string,
  termCode: string,
  termName: string,
  name: string,
  campus: string,
  url: string,
}


export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const UPDATE_TIME_KEY = 'timetable_update_time';

const getBaseUrl = (year: number) => `https://www.timetable.usyd.edu.au/uostimetables/${year}/`;

class UOSTimetableScraper {
  scraper: Scraper;
  state: StateManager | undefined;
  readonly uni = USYD;
  coursePages: CoursePage[] = [];
  maxCourses = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  baseUrl: string;

  protected dataUpdateTime: string | null | undefined = null;

  constructor({ state, year }: UOSTimetableScraperConfig = {}) {
    this.scraper = new Scraper();
    this.scraper.logger = logger;
    this.state = state === undefined ? getStateManager() : state || undefined;
    this.baseUrl = getBaseUrl(year || (new Date()).getFullYear());
  }

  async setup() {
    this.coursePages = await this.findCoursePages();

    if (!await this.checkIfDataUpdated()) {
      logger.info('data has not been updated yet');
      return false;
    }

    return true;
  }

  async scrape(): Promise<CourseData[][]> {
    logger.info(`scraping from ${this.baseUrl}`);
    const courses = await this.scrapeCoursePages(this.coursePages);
    logger.info('persisting results to DynamoDB');
    await this.persistState();
    logger.info('finished persisting results to DynamoDB');
    this.scraper.report();
    logger.info('splitting courses by terms');
    const results = splitTerms(courses);
    return results;
  }

  async persistState() {
    if (this.state) {
      await this.state.set(this.uni, UPDATE_TIME_KEY, this.dataUpdateTime);
      logger.info(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);
    }
  }

  async checkIfDataUpdated() {
    if (!this.state) {
      return true;
    }

    // Update data if source has changed
    const lastUpdateTime = await this.state.get(this.uni, UPDATE_TIME_KEY);
    if (lastUpdateTime !== this.dataUpdateTime) {
      return true;
    }

    return false;
  }

  getUpdateTime($: CheerioStatic) {
    const timeText = $('p>small').text();
    // Remove timezone because it confuses parsers and is inconsistent
    this.dataUpdateTime = timeText.replace('This page generated at:', '').trim();
  }

  async findCoursePages() {
    const pages: CoursePage[] = [];
    await this.scraper.scrapePages([this.baseUrl], async $ => {
      const table = $('table tr').toArray().slice(1);
      for (const row of table) {
        const cells = $(row).children('td').toArray().map(c => $(c).text().trim());
        const [code, termCode, termName, name, campus] = cells;
        const link = $(row).children('td').first().children('a').attr('href');
        if (link && shouldIncludeTerm(termCode)) {
          const url = `${this.baseUrl}/${link}`;
          pages.push({ code, termCode, termName, name, campus, url });
        }
      }

      this.getUpdateTime($);
    });

    pages.length = Math.min(pages.length, this.maxCourses);

    logger.info(`found ${pages.length} valid course pages`);
    return pages;
  }

  async scrapeCoursePages(pages: CoursePage[]) {
    const pageLookup: { [url: string]: CoursePage } = {};
    for (const page of pages) { pageLookup[page.url] = page; }
    const urls = Object.keys(pageLookup);
    const courses = await this.scraper.scrapePages(
      urls,
      ($, url) => this.scrapeCoursePage($, pageLookup[url]),
    );
    logger.info(`parsed ${courses.length} courses`);

    // Remove duplicate streams from each course
    for (const course of courses) {
      removeDuplicateStreams(course);
    }

    // Sort courses for consistency
    courses.sort(courseSort);

    return courses;
  }

  async scrapeCoursePage($: CheerioStatic, courseDetails: CoursePage): Promise<CourseData> {
    // Find all top-level tables
    const courseTables = $('table').not('table table');
    const partTables = courseTables.slice(1).toArray();
    const componentStreams: StreamData[][] = partTables.map(table => {
      const rows = $(table).find('tr').not('tr tr');
      const component = rows.first().text().replace(/Part\s*/i, '').trim().split(/\s+/)[0];
      return this.parseStreamRows(rows.toArray(), component);
    });

    const { code, name, termCode } = courseDetails;
    const streams = componentStreams.flat();
    const course: CourseData = {
      code,
      name,
      streams,
      term: termCode,
    };
    return course;
  }

  private parseStreamRows(streamRows: CheerioElement[], component: string): StreamData[] {
    const streams: StreamData[] = [];
    for (const rowElement of streamRows.slice(2)) {
      const row = cheerio(rowElement);
      const cells = row.children('td');
      const streamCode = cells.first().text();
      const full = isStreamClosed(streamCode);
      const detailsRows = cells.children('table').children('tbody').children('tr').toArray();
      const allTimes = this.parseDetailsRows(detailsRows);
      const times = mergeTimes(allTimes);
      streams.push({ component, times, full });
    }
    return streams;
  }

  private parseDetailsRows(detailsRows: CheerioElement[]): ClassTime[] {
    const allTimes: ClassTime[] = [];
    for (const detailRow of detailsRows) {
      const cells = cheerio(detailRow).children('td').toArray().map(td => cheerio(td).text().trim());
      // Skip notes on streams or other unexpected data
      if (cells.length !== 4) {
        continue;
      }
      const [day, time, weeks, location] = cells;
      const classTime: ClassTime = {
        time: getTime(day, time),
        weeks: getWeeks(weeks),
        location: getLocation(location),
      };
      if (!shouldSkipTime(classTime)) {
        allTimes.push(classTime);
      }
    }
    return allTimes;
  }

  static async getLatestYear(_scraper?: Scraper) {
    // Check if data for next year has been released yet
    const scraper = _scraper || new Scraper();
    const currentYear = getAEST().toDate().getFullYear();
    try {
      await scraper.getPageContent(getBaseUrl(currentYear + 1));
      return currentYear + 1;
    } catch (error) {
      return currentYear;
    }
  }
}

export default UOSTimetableScraper;

export function shouldIncludeTerm(termCode: string) {
  const whitelistRegex = /^S[12]C$/i;
  return whitelistRegex.test(termCode);
}

export function shouldSkipTime(time: ClassTime) {
  if (time.location !== undefined) {
    // Skip times for pre-recorded online classes
    const location = time.location.toLowerCase();
    if (/online\s*pre-?recorded/.test(location)) {
      return true;
    }
  }

  return false;
}

export function isStreamClosed(streamCode: string): true | undefined {
  return streamCode.toLowerCase().includes('class closed') || undefined;
}

export function getTime(_day: string, _time: string): string {
  const day = abbreviateDay(_day);
  const time = _time.replace(/:30/g, '.5').replace(/:[0-9]{2}/g, '');
  const [start, end] = time.split(/-/).map(parseFloat);
  const timeStr = (end - start === 1) ? start.toString() : `${start}-${end}`;
  return `${day}${timeStr}`;
}

export function getWeeks(_weeks: string): string {
  let weeks = _weeks.replace(/^\[wks?\s{0,2}([^\]]{1,20})\].*$/, '$1');
  weeks = weeks.replace(/\s{0,2}to\s{0,2}/g, '-').replace(/,\s{0,2}/g, ',');
  return weeks;
}

export function getLocation(location: string): string {
  return location.replace(/^in /, '');
}

function getWeekList(weekSets: string[]): number[] {
  const resultSet = new Set<number>();
  const ranges = weekSets.map(w => w.split(/,\s?/g)).flat();
  for (const range of ranges) {
    const [start, end] = range.split(/-/).map(x => parseInt(x));
    const stop = end || start;
    for (let i = start; i <= stop; i++) {
      resultSet.add(i);
    }
  }
  const weekList = Array.from(resultSet.values()).sort((a, b) => +(a > b) - +(a < b));
  return weekList;
}

function getRange(start: number, end: number): string {
  return start === end ? start.toString() : `${start}-${end}`;
}

function weeksToRanges(weeks: number[]): string[] {
  const weekTextParts = [];
  let currentStart = weeks[0];
  for (let i = 1; i < weeks.length; ++i) {
    const n = weeks[i];
    const previous = weeks[i - 1];
    if (n > previous + 1) {
      weekTextParts.push(getRange(currentStart, previous));
      currentStart = n;
    }
    if (i === weeks.length - 1) {
      weekTextParts.push(getRange(currentStart, n));
    }
  }
  return weekTextParts;
}

export function mergeWeeks(weeks: string[]): string | undefined {
  const weekList = getWeekList(weeks);
  const ranges = weeksToRanges(weekList);
  return ranges.join(',') || undefined;
}

function pickLocation(times: ClassTime[]) {
  const locations = times.filter(t => t.location).map(t => t.location!);
  return locations.find(l => !l.toLowerCase().includes('online')) || locations[0];
}

type TimesMap = { [time: string]: ClassTime[] };
function groupTimes(times: ClassTime[]): TimesMap {
  const timesMap: TimesMap = {};
  for (const time of times) {
    if (timesMap[time.time]) {
      timesMap[time.time].push(time);
    } else {
      timesMap[time.time] = [time];
    }
  }
  return timesMap;
}

export function mergeTimes(times: ClassTime[]): ClassTime[] {
  if (times.length <= 1) {
    return times;
  }

  const timesMap = groupTimes(times);
  return Object.values(timesMap).map(timeGroup => {
    const time = timeGroup[0].time;
    const weeks = mergeWeeks(timeGroup.filter(t => t.weeks).map(t => t.weeks!));
    const location = pickLocation(timeGroup);
    return { time, location, weeks };
  });
}

export function splitTerms(courses: CourseData[]): CourseData[][] {
  const results: CourseData[][] = [[], []];
  for (const course of courses) {
    if (!course.term) {
      logger.warn(`no term found for course ${course.code}`);
      continue;
    }

    // Extract term number from course
    const term = parseInt(course.term.replace(/[^\d]/g, ''));

    // Throw away the term info now, since we no longer need it
    const newCourse: CourseData = {
      ...course,
      term: undefined,
    };

    results[term - 1].push(newCourse);
  }
  return results;
}
