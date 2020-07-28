import { Scraper } from '../Scraper';
import { CourseData, Career } from '../../../app/src/state/Course';
import { ClassTime, StreamData, DeliveryType } from '../../../app/src/state/Stream';
import StateManager from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import additional from '../../data/additional';
import { hashData } from '../../data/util';
import { removeDuplicateStreams } from './commonUtils';


export interface ClassUtilScraperConfig {
  scraper?: Scraper,
  parser?: Parser,
  state?: StateManager | null,
}


export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const TABLE_END_COUNT = 1;
const COURSE_HEADING_COUNT = 2;
const REGULAR_CELL_COUNT = 8;

const CACHE_KEY = 'classutil_last_data';
const UPDATE_TIME_KEY = 'classutil_update_time';
const ADDITIONAL_HASH_KEY = 'additional_data_hash';

const ADDITIONAL_DATA = additional.unsw;
const ADDITIONAL_DATA_HASH = hashData(ADDITIONAL_DATA);

export const CLASSUTIL = 'http://classutil.unsw.edu.au';

export class ClassUtilScraper {
  scraper: Scraper;
  parser: Parser;
  state: StateManager | undefined;
  readonly campus = 'unsw';
  facultyPages: string[] = [];
  maxFaculties = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  logging = process.env.NODE_ENV !== 'test';

  protected dataUpdateTime: string | null | undefined = null;

  constructor ({ scraper, parser, state }: ClassUtilScraperConfig = {}) {
    this.scraper = scraper || new Scraper();
    this.parser = parser || new Parser();
    this.state = state === undefined ? getStateManager() : state || undefined;
  }

  async setup () {
    this.facultyPages = await this.findFacultyPages();

    if (!await this.checkIfDataUpdated()) {
      this.log('data has not been updated yet');
      return false;
    }

    return true;
  }

  async scrape (term: number): Promise<CourseData[]> {
    this.checkTerm(term);

    this.log(`scraping term ${term} from ${CLASSUTIL}`);
    const termLinkEnd = `${term}.html`;
    const facultyPages = this.facultyPages.filter(l => l.endsWith(termLinkEnd));
    const results = await this.scrapeFacultyPages(facultyPages);
    console.log('Persisting results to DynamoDB');
    await this.persistState(results, term);
    console.log('Finished persisting results to DynamoDB');
    return results;
  }

  getCacheKey (term: number) {
    return `${CACHE_KEY}_term_${term}`;
  }

  async getCache (term: number): Promise<CourseData[]> {
    if (this.state) {
      const cacheKey = this.getCacheKey(term);
      return await this.state.getBlob(this.campus, cacheKey) || [];
    }
    return [];
  }

  async persistState (result: CourseData[], term: number) {
    if (this.state) {
      await this.state.set(this.campus, UPDATE_TIME_KEY, this.dataUpdateTime);
      await this.state.set(this.campus, ADDITIONAL_HASH_KEY, ADDITIONAL_DATA_HASH);
      this.log(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);

      const cacheKey = this.getCacheKey(term);
      await this.state.setBlob(this.campus, cacheKey, result);
    }
  }

  async checkIfDataUpdated () {
    if (!this.state) {
      return true;
    }

    // Update data if source has changed
    const lastUpdateTime = await this.state.get(this.campus, UPDATE_TIME_KEY);
    if (lastUpdateTime !== this.dataUpdateTime) {
      return true;
    }

    // Update data if additional data has changed
    // TODO: lift to UNSW scraper
    const oldAdditionalHash = await this.state.get(this.campus, ADDITIONAL_HASH_KEY);
    if (ADDITIONAL_DATA_HASH !== oldAdditionalHash) {
      return true;
    }

    return false;
  }

  private getUpdateTime ($: CheerioStatic) {
    const timeText = $('p>strong').text();
    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    this.dataUpdateTime = withoutTZ.replace(/\s\s{1,20}/g, ' ');
  }

  private async findFacultyPages () {
    const links: string[] = [];
    const linkRegex = /[A-Y][A-Z]{3}_[ST][0-9]\.html$/i;
    await this.scraper.scrapePages([CLASSUTIL], async ($) => {
      const allLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = allLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);

      this.getUpdateTime($);
    });

    links.length = Math.min(links.length, this.maxFaculties);

    this.log(`found ${links.length} faculty pages`);
    return links;
  }

  private async scrapeFacultyPages (pages: string[]) {
    const urls = pages.map(page => `${CLASSUTIL}/${page}`);
    const results = await this.scraper.scrapePages(urls, page => this.parser.parseFacultyPage(page));
    const allCourses = results.flat();

    // Remove duplicate streams from each course
    for (let course of allCourses) {
      removeDuplicateStreams(course);
    }

    // Add (campus-specific) additional events
    allCourses.push(...ADDITIONAL_DATA);

    // Sort courses for consistency
    allCourses.sort(courseSort);

    this.log(`parsed ${allCourses.length} courses`);
    return allCourses;
  }

  checkTerm (term: number) {
    if (term < 1 || term > 3) {
      throw new Error(`ClassUtilScraper does not support scraping term ${term}`);
    }
  }

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.campus.toUpperCase()}:`, ...args);
    }
  }
}

export default ClassUtilScraper;


export class Parser {
  async parseFacultyPage ($: CheerioStatic): Promise<CourseData[]> {
    // Get all rows of the table
    const rows = Array.from($($('table').get(2)).find('tr'));

    // Remove first row (which is the header)
    const bodyRows = rows.slice(1);
    const courses: CourseData[] = [];
    let courseCode: string = '';
    let courseName: string = '';
    let newCourse = false;

    for (const row of bodyRows) {
      let currentCourse = courses[courses.length - 1];
      const cells = $(row).find('td');

      if (cells.length === TABLE_END_COUNT) {
        break;
      } else if (cells.length === COURSE_HEADING_COUNT) {
        courseCode = $(cells.get(0)).text().trim();
        courseName = $(cells.get(1)).text().trim();
        newCourse = true;
      } else if (cells.length === REGULAR_CELL_COUNT) {
        // Check for course enrolment streams
        const component = $(cells.get(0)).text().trim();
        const section = $(cells.get(1)).text().trim();
        const status = $(cells.get(4)).text().trim();
        const enrols = $(cells.get(5)).text().trim();
        const times = $(cells.get(7)).text().trim();

        // Handle new course
        if (component === 'CRS') {
          courses.push(this.parseCourse(courseCode, courseName, section, times));
          newCourse = false;
          continue;
        }

        // Handle streams listed before any course enrolment
        if (newCourse === true) {
          courses.push(this.parseCourse(courseCode, courseName));
          currentCourse = courses[courses.length - 1];
          newCourse = false;
        }

        const stream = this.parseStream(component, section, status, enrols, times);
        if (stream !== null) {
          currentCourse.streams.push(stream);
        }
      }
    }

    return courses;
  }

  parseCourse (code: string, rawName: string, section?: string, time?: string): CourseData {
    const term = this.extractTerm(rawName);
    const termRegex = new RegExp(`\\s*\\(${term}\\)$`);
    const name = rawName.replace(termRegex, '');
    const career = time ? (time.toLowerCase().includes('ugrd') ? Career.UGRD : Career.PGRD) : undefined;
    return {
      code,
      name,
      streams: [],
      term,
      section: section || undefined,
      career,
    };
  }

  parseStream (
    component: string,
    section: string,
    status: string,
    enrolString: string,
    timeString: string,
  ): StreamData | null {
    status = status.replace(/\*$/, '').toLowerCase();
    if (status !== 'open' && status !== 'full') {
      return null;
    }
    const full = status === 'full' ? true : undefined;

    const enrols = enrolString.split(' ')[0].split('/').map(x => parseInt(x)) as [number, number];
    if (enrols[1] === 0) {
      return null;
    }

    let web = undefined;
    let times: ClassTime[] | null = null;
    if (section.includes('WEB')) {
      // Standardise all web streams as 'LEC' component
      component = 'LEC';
      web = true;
    } else {
      times = this.parseTimeStr(timeString);
      if (times === null || times.length === 0) {
        return null;
      }
    }

    let delivery: DeliveryType | undefined;
    if (times) {
      const onlineTimes = times.filter(t => t.location && t.location.toLowerCase().replace(/[()]/g, '') === 'online');
      if (onlineTimes.length === times.length) {
        delivery = DeliveryType.online;
      } else if (onlineTimes.length === 0) {
        delivery = DeliveryType.person;
      } else {
        delivery = DeliveryType.mixed;
      }
    } else if (web) {
      delivery = DeliveryType.online;
    }

    return {
      component,
      enrols,
      full,
      times,
      web,
      delivery,
    };
  }

  extractTerm (name: string) {
    const matches = / \(([A-Z][A-Z0-9]{2})\)$/.exec(name) || [];
    return matches[1];
  }

  parseTimeStr (timeString: string): ClassTime[] | null {
    // Basic string sanitisation
    timeString = timeString.replace(/\/odd|\/even|Comb\/w.*/g, '').trim();

    // Return empty list if no data has been given
    if (timeString === '') {
      return [];
    }

    if (timeString.indexOf('; ') !== -1) {
      const timeParts = timeString.split('; ');
      const times = timeParts.reduce((a: ClassTime[], t) => a.concat(this._parseTimeStringData(t)), []);

      // Remove any duplicate times
      const timeSet = new Set();
      const finalTimes: ClassTime[] = [];
      for (let time of times) {
        if (!timeSet.has(time.time)) {
          timeSet.add(time.time);
          finalTimes.push(time);
        }
      }

      return finalTimes;
    } else {
      return this._parseTimeStringData(timeString);
    }
  }

  private _parseTimeStringData (data: string): ClassTime[] {
    const openBracketIndex = data.indexOf('(');
    if (openBracketIndex !== -1) {
      const tidiedTime = this.tidyUpTime(data.slice(0, openBracketIndex).trim());
      if (tidiedTime === null) {
        return [];
      }
      const [time, canClash] = tidiedTime;

      const otherDetails = data.slice(openBracketIndex + 1, data.indexOf(')'));
      const weeks = this.getWeeks(otherDetails);
      if (weeks === null) {
        return [];
      }

      const commaIndex = otherDetails.indexOf(', ');
      let location = '';
      if (commaIndex !== -1) {
        location = otherDetails.slice(commaIndex + 2);
      } else if (otherDetails.length > 0 && otherDetails[0] !== 'w') {
        location = otherDetails;
      }

      location = location.toLowerCase() !== 'see school' ? location : '';

      return [{
        time,
        weeks: weeks || undefined,
        location: location || undefined,
        canClash,
      }];
    } else {
      const tidiedTime = this.tidyUpTime(data);
      if (tidiedTime !== null) {
        const [ time, canClash ] = tidiedTime;
        return [{ time, canClash }];
      } else {
        return [];
      }
    }
  }

  private tidyUpTime (time: string): [string, boolean | undefined] | null {
    if (time === '' || time === '00-00') {
      return null;
    }

    const days = {'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F', 'Sat': 'S', 'Sun': 's'};
    for (let [day, letter] of Object.entries(days)) {
      time = time.replace(day + ' ', letter);
    }

    // Use decimal notation for half-hours
    time = time.replace(':30', '.5');

    // Remove leading zeros
    time = time.replace(/(?<=[MTWHFSs])0(?=[0-9])/, '');

    // Don't include courses which run over multiple days (usually intensives) or on weekends
    if (isNaN(+time[1]) || time.toLocaleLowerCase().indexOf('s') !== -1) {
      return null;
    }

    const canClash = time.endsWith('#') ? true : undefined;
    time = time.replace(/#$/, '');

    return [time, canClash];
  }

  private getWeeks (weeks: string) {
    weeks = weeks.split(', ')[0].replace(/^[, ]|[, ]$/g, '');

    if (weeks === '' || weeks[0] !== 'w') {
      return '';
    }

    weeks = weeks.replace(/^w/, '');

    // Don't include classes which only run outside of regular term weeks
    if (/^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks)) {
      return null;
    }

    return weeks;
  }
}
