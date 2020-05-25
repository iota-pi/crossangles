import { Scraper } from '../Scraper';
import { ClassTime, CourseData, StreamData } from '../../../app/src/state';
import StateManager from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import additional from '../../data/additional';
import { hashData } from '../../data/util';
import { CourseNameMap } from './handbook';
import { removeDuplicateStreams } from './commonUtils';


export interface ClassUtilScraperConfig {
  scraper?: Scraper,
  parser?: Parser,
  state?: StateManager,
}


export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const TABLE_END_COUNT = 1;
const COURSE_HEADING_COUNT = 2;
const REGULAR_CELL_COUNT = 8;

const UPDATE_TIME_KEY = 'classutil_update_time';
const ADDITIONAL_HASH_KEY = 'additional_data_hash';

const ADDITIONAL_DATA = additional.unsw;
const ADDITIONAL_DATA_HASH = hashData(ADDITIONAL_DATA);

export const CLASSUTIL = 'http://classutil.unsw.edu.au';

export class ClassUtilScraper {
  scraper: Scraper;
  parser: Parser;
  protected state: StateManager;
  readonly campus = 'unsw';
  facultyPages: string[] = [];
  maxFaculties = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  logging = process.env.NODE_ENV !== 'test';

  protected dataUpdateTime: string | null | undefined = null;

  constructor ({ scraper, parser, state }: ClassUtilScraperConfig) {
    this.scraper = scraper || new Scraper();
    this.parser = parser || new Parser();
    this.state = state || getStateManager();
  }

  async setup () {
    this.facultyPages = await this.findFacultyPages();

    if (!await this.checkIfDataUpdated()) {
      this.log('data has not been updated yet; nothing to do');
      return false;
    }

    return true;
  }

  async scrape (term: number) {
    this.log(`scraping term ${term} from ${CLASSUTIL}`);
    const termLinkEnd = `${term}.html`;
    const facultyPages = this.facultyPages.filter(l => l.endsWith(termLinkEnd));

    return await this.scrapeFacultyPages(facultyPages);
  }

  async checkIfDataUpdated () {
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

  async persistState () {
    if (this.state) {
      this.state.set(this.campus, UPDATE_TIME_KEY, this.dataUpdateTime);
      this.state.set(this.campus, ADDITIONAL_HASH_KEY, ADDITIONAL_DATA_HASH);
      this.log(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);
    }
  }

  private getUpdateTime ($: CheerioStatic) {
    const timeText = $('p>strong').text();
    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    this.dataUpdateTime = withoutTZ;
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

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.campus.toUpperCase()}:`, ...args);
    }
  }
}

export default ClassUtilScraper;


export class Parser {
  courseNames: CourseNameMap = {};

  async parseFacultyPage ($: CheerioStatic): Promise<CourseData[]> {
    // Get all rows of the table
    const rows = Array.from($($('table').get(2)).find('tr'));

    // Remove first row (which is the header)
    const bodyRows = rows.slice(1);
    const courses: CourseData[] = [];

    for (const row of bodyRows) {
      const cells = $(row).find('td');

      if (cells.length === TABLE_END_COUNT) {
        break;
      } else if (cells.length === COURSE_HEADING_COUNT) {
        const course = this.parseCourse(
          $(cells.get(0)).text().trim(),
          $(cells.get(1)).text().trim(),
        );
        courses.push(course);
      } else if (cells.length === REGULAR_CELL_COUNT) {
        const course = courses[courses.length - 1];
        const stream = this.parseStream(
          $(cells.get(0)).text(),
          $(cells.get(1)).text(),
          $(cells.get(4)).text(),
          $(cells.get(5)).text(),
          $(cells.get(7)).text(),
        );
        if (stream !== null) {
          course.streams.push(stream);
        }
      }
    }

    return courses;
  }

  parseCourse (code: string, rawName: string): CourseData {
    const term = this.extractTerm(rawName);
    const termRegex = new RegExp(`\\s*\\(${term}\\)$`);
    const name = this.courseNames[code] || rawName.replace(termRegex, '');
    return {
      code,
      name,
      streams: [],
      term,
    };
  }

  parseStream (
    component: string,
    section: string,
    status: string,
    enrolString: string,
    timeString: string,
  ): StreamData | null {
    if (component === 'CRS') {
      return null;
    }

    status = status.trim().replace(/\*$/, '').toLowerCase();
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
    if (section.indexOf('WEB') === -1) {
      times = this.parseTimeStr(timeString);

      if (times === null || times.length === 0) {
        return null;
      }
    } else {
      web = true;

      // Standardise all web streams as 'LEC' component
      component = 'LEC';
    }

    return {
      component,
      enrols,
      full,
      times,
      web,
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
