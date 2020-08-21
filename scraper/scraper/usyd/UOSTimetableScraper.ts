import { Scraper } from '../Scraper';
import { CourseData } from '../../../app/src/state/Course';
import { StateManager } from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import { getLogger } from '../../logging';
import getAEST from '../../getAEST';
import { USYD } from './scrapeUSYD';
import { StreamData, ClassTime } from '../../../app/src/state/Stream';
import { abbreviateDay } from '../unsw/TimetableScraper';

const logger = getLogger('UOSTimetableScraper', { campus: USYD });


export interface UOSTimetableScraperConfig {
  scraper?: Scraper,
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

const CACHE_KEY = 'timetable_last_data';
const UPDATE_TIME_KEY = 'timetable_update_time';

const getBaseUrl = (year: number) => `https://www.timetable.usyd.edu.au/uostimetables/${year}/`;

export class UOSTimetableScraper {
  scraper: Scraper;
  state: StateManager | undefined;
  readonly uni = USYD;
  coursePages: CoursePage[] = [];
  maxCourses = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  baseUrl: string;

  protected dataUpdateTime: string | null | undefined = null;

  constructor({ scraper, state, year }: UOSTimetableScraperConfig = {}) {
    this.scraper = scraper || new Scraper();
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

  async scrape(): Promise<CourseData[]> {
    logger.info(`scraping from ${this.baseUrl}`);
    const results = await this.scrapeCoursePages(this.coursePages);
    logger.info('Persisting results to DynamoDB');
    await this.persistState(results);
    logger.info('Finished persisting results to DynamoDB');
    this.scraper.report();
    return results;
  }

  async getCache(): Promise<CourseData[]> {
    if (this.state) {
      return await this.state.getBlob(this.uni, CACHE_KEY) || [];
    }
    return [];
  }

  async persistState(result: CourseData[]) {
    if (this.state) {
      await this.state.set(this.uni, UPDATE_TIME_KEY, this.dataUpdateTime);
      logger.info(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);

      await this.state.setBlob(this.uni, CACHE_KEY, result);
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

  private getUpdateTime($: CheerioStatic) {
    const timeText = $('p>small').text();
    // Remove timezone because it confuses parsers and is inconsistent
    this.dataUpdateTime = timeText.replace('This page generated at:', '').trim();
  }

  private async findCoursePages() {
    const pages: CoursePage[] = [];
    // const linkRegex = /timetables\/[A-Y][A-Z]{3}[0-9]{4}.{0,16}\.html$/i;
    await this.scraper.scrapePages([this.baseUrl], async $ => {
      const table = $('table tr').toArray().slice(1);
      for (const row of table) {
        const cells = $(row).children('td').toArray().map(c => $(c).text().trim());
        const [code, termCode, termName, name, campus] = cells;
        const link = $(row).children('td').first().children('a').attr('href');
        if (link) {
          let url = `${this.baseUrl}/${link}`;
          pages.push({ code, termCode, termName, name, campus, url });
        }
      }

      this.getUpdateTime($);
    });

    pages.length = Math.min(pages.length, this.maxCourses);

    logger.info(`found ${pages.length} course pages`);
    return pages;
  }

  private async scrapeCoursePages(pages: CoursePage[]) {
    pages.length = 1;
    const pageLookup: { [url: string]: CoursePage } = {};
    for (const page of pages) { pageLookup[page.url] = page; }
    const urls = Object.keys(pageLookup);
    const handbookRegex = /^(?:https?:\/\/)?www\.sydney\.edu\.au\/units\//;
    const courses = await this.scraper.scrapePages(
      urls,
      ($, url) => this.scrapeCoursePage($, pageLookup[url]),
    );

    return courses;
    // const results = await this.scraper.scrapePages(
    //   urls, page => this.parser.parseFacultyPage(page),
    // );
    // const allCourses = results.flat();

    // // Remove duplicate streams from each course
    // for (const course of allCourses) {
    //   removeDuplicateStreams(course);
    // }

    // // Sort courses for consistency
    // allCourses.sort(courseSort);

    // logger.info(`parsed ${allCourses.length} courses`);
    // return allCourses;
  }

  private async scrapeCoursePage($: CheerioStatic, courseDetails: CoursePage) {
    // Find all top-level tables
    const courseTables = $('table').not('table table');
    const partTables = courseTables.slice(1).toArray();
    const componentStreams: StreamData[][] = partTables.map(table => {
      const rows = $(table).find('tr').not('tr tr');
      const component = rows.first().text().replace(/Part\s*/i, '').split(/\s*/)[0];
      const streams: StreamData[] = [];
      for (const row of rows.slice(2).toArray()) {
        const detailsTable = $(row).children('td').children('table');
        const detailsRows = detailsTable.children('tbody').children('tr').toArray();
        const stream: StreamData = {
          component,
          times: [],
        };
        for (const detailRow of detailsRows) {
          const cells = $(detailRow).children('td').toArray().map(td => $(td).text().trim());
          const [day, time, weeks, location] = cells;
          stream.times.push({
            time: getTime(day, time),
            weeks: getWeeks(weeks),
            location: getLocation(location),
          })
        }
        streams.push(stream);
      }
      return streams;
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

export function getTime(_day: string, _time: string): string {
  const day = abbreviateDay(_day);
  const time = _time.replace(/:30/g, '.5').replace(/:[0-9]{2}/g, '');
  const [start, end] = time.split(/-/).map(parseFloat);
  const timeStr = (end - start === 1) ? start.toString() : `${start}-${end}`;
  return `${day}${timeStr}`;
}

export function getWeeks(_weeks: string): string {
  let weeks = _weeks.replace(/^\[([^\]]{1,20})\].*$/, '$1');
  weeks = weeks.replace(/wks?\s{0,2}/, '').replace(/\s{0,2}to\s{0,2}/, '-');
  return weeks;
}

function getWeekList(weeks: string[]): number[] {
  const weeksSet = new Set<number>();
  for (const w of weeks) {
    if (w.includes('-')) {
      const [start, end] = w.split(/-/).map(x => parseInt(x));
      for (let i = start; i <= end; i++) {
        weeksSet.add(i);
      }
    } else {
      weeksSet.add(parseInt(w));
    }
  }
  const weekList = Array.from(weeksSet.values()).sort((a, b) => +(a > b) - +(a < b));
  return weekList;
}

function getRange(start: number, end: number): string {
  return start === end ? start.toString() : `${start}-${end}`;
}

function weeksToRanges(weeks: number[]): string[] {
  let weekTextParts = [];
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

export function mergeWeeks(weeks: string[]): string {
  const weekList = getWeekList(weeks);
  const ranges = weeksToRanges(weekList);
  return ranges.join(',');
}

export function getLocation(location: string): string {
  return location.replace(/^in /, '');
}

