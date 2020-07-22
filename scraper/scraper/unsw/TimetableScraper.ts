import $ from 'cheerio';
import { Scraper } from '../Scraper';
import { CourseData } from '../../../app/src/state/Course';
import { ClassTime, StreamData } from '../../../app/src/state/Stream';
import StateManager from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import { removeDuplicateStreams } from './commonUtils';

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const UPDATE_TIME_KEY = 'timetable_update_time';
const CACHE_KEY = 'timetable_last_data';

export const TIMETABLE_UNSW = 'http://timetable.unsw.edu.au';

export interface TimetableScraperConfig {
  scraper?: Scraper,
  state?: StateManager,
  year?: number,
}

export interface StreamTableData {
  'Class Nbr': string,
  'Section': string,
  'Teaching Period': string,
  'Activity': string,
  'Status': string,
  'Enrols/Capacity': string,
  'Offering Period': string,
  'Meeting Dates': string,
  'Census Date': string,
  'Instruction Mode': string,
  'Consent': string,
  'Meeting Information': string,
  'Class Notes': string,
}

export class TimetableScraper {
  scraper: Scraper;
  state: StateManager | undefined;
  readonly campus = 'unsw';
  maxFaculties = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  maxCourses = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  facultyPages: string[] = [];
  logging = process.env.NODE_ENV !== 'test';
  baseURL: string;
  year: number;

  protected dataUpdateTime: string | null | undefined = null;

  constructor ({ scraper, state, year }: TimetableScraperConfig = {}) {
    this.scraper = scraper || new Scraper();
    this.state = state || getStateManager();
    this.year = year || new Date().getFullYear();
    this.baseURL = `${TIMETABLE_UNSW}/${this.year}`;
  }

  async setup () {
    this.facultyPages = await this.findFacultyPages();

    if (!await this.checkIfDataUpdated()) {
      this.log('data has not been updated yet');
      return false;
    }

    return true;
  }

  async scrape (): Promise<CourseData[][]> {
    this.log(`scraping from ${TIMETABLE_UNSW}`);
    const coursePages = await this.scrapeFacultyPages();
    const result = await this.scrapeCoursePages(coursePages);
    this.log('Persisting state to DynamoDB');
    await this.persistState(result);
    this.log('Finished persisting state to DynamoDB');
    return result;
  }

  async getCache (): Promise<CourseData[][]> {
    if (this.state) {
      return await this.state.getBlob(this.campus, CACHE_KEY) || [];
    }
    return [];
  }

  async persistState (result: CourseData[][]) {
    if (this.state) {
      await this.state.set(this.campus, UPDATE_TIME_KEY, this.dataUpdateTime);
      this.log(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);
      await this.state.setBlob(this.campus, CACHE_KEY, result);
    }
  }

  async checkIfDataUpdated () {
    // Can't check update time, presume has been updated since last scrape
    if (!this.state) {
      return true;
    }

    // Update data if source has changed
    const lastUpdateTime = await this.state.get(this.campus, UPDATE_TIME_KEY);
    if (lastUpdateTime !== this.dataUpdateTime) {
      return true;
    }

    return false;
  }

  private getUpdateTime ($: CheerioStatic) {
    let timeText = $('td.note:contains("Data is correct as at")').text();
    timeText = timeText.replace('Data is correct as at', '').trim();

    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    this.dataUpdateTime = withoutTZ.replace(/\s\s{1,20}/g, ' ');
  }

  private async findFacultyPages () {
    const links: string[] = [];
    const linkRegex = /[A-Y][A-Z]{3}(KENS|COFA)\.html$/i;
    await this.scraper.scrapePages([this.baseURL], async ($) => {
      const pageLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = pageLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);

      this.getUpdateTime($);
    });

    const uniqueLinks = links.filter((link, i) => links.indexOf(link) === i);
    uniqueLinks.length = Math.min(uniqueLinks.length, this.maxFaculties);

    this.log(`found ${uniqueLinks.length} faculty pages`);
    return uniqueLinks;
  }

  private async scrapeFacultyPages () {
    const urls = this.facultyPages.map(page => `${this.baseURL}/${page}`);
    const links: string[] = [];
    const linkRegex = /[A-Z]{4}[0-9]{4}\.html$/i;
    await this.scraper.scrapePages(urls, async ($) => {
      const pageLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = pageLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);
    });

    const uniqueLinks = links.filter((link, i) => links.indexOf(link) === i);
    uniqueLinks.length = Math.min(uniqueLinks.length, this.maxCourses);

    this.log(`found ${uniqueLinks.length} course pages`);
    return uniqueLinks;
  }

  private async scrapeCoursePages (pages: string[]) {
    const urls = pages.map(page => `${this.baseURL}/${page}`);
    const allCourses: CourseData[][] = [[], [], []];
    const courseCodeRegex = /([A-Z]{4}[0-9]{4})/i;
    await this.scraper.scrapePages(urls, async ($, url) => {
      const code = (courseCodeRegex.exec(url) || [])[1];
      const name = getCourseName($, code);
      const courses: CourseData[] = [
        { code, name, streams: [] },
        { code, name, streams: [] },
        { code, name, streams: [] },
      ];

      const streamTables = $('td.label:contains("Class Nbr")').parent().parent().toArray();
      for (const streamTable of streamTables) {
        const data = this.parseTable($(streamTable));
        if (shouldSkipStream(data)) {
          continue;
        }
        const stream: StreamData = {
          component: getComponent(data),
          enrols: getEnrols(data['Enrols/Capacity']),
          full: getIsFull(data['Status']),
          web: getIsWeb(data['Section']),
          times: [],
          notes: data['Class Notes'] || undefined,
        };

        const timesRows = $(streamTable).find('table tr:has(td.data)').toArray();
        for (const row of timesRows) {
          const cells = $(row).children('td.data').toArray().map(e => $(e).text().trim());
          const [day, time, location, weeks, instructor] = cells;
          const timeStr = abbreviateDay(day) + shortenTime(time);
          const locationName = splitLocation(location)[0];
          const timeObject: ClassTime = {
            time: timeStr,
            location: locationName || undefined,
            weeks,
          };

          if (!shouldSkipTime(timeObject)) {
            stream.times!.push(timeObject);
          }
        }

        // Skip streams without any associated times (unless it's a web stream)
        if (stream.times!.length === 0 && !stream.web) {
          continue;
        }

        const term = getTermNumber(data['Teaching Period']);
        if (courses[term - 1] !== undefined) {
          courses[term - 1].streams.push(stream);
        }
      }

      for (let i = 0; i < courses.length; ++i) {
        removeDuplicateStreams(courses[i]);
        allCourses[i].push(courses[i]);
      }
    });

    return allCourses;
  }

  private parseTable (table: Cheerio): StreamTableData {
    const allLabels = table.find('td.label').toArray().map(element => $(element).text().trim());
    const labels = allLabels.filter(l => l.toLowerCase() !== 'meeting information');
    const data = table.children('tr').children('td.data').toArray().map(element => $(element).text().trim());
    const mapping: Partial<StreamTableData> = {};
    for (let i = 0; i < labels.length; i++) {
      mapping[labels[i] as keyof StreamTableData] = data[i] || '';
    }
    return mapping as StreamTableData;
  }

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.campus.toUpperCase()}:`, ...args);
    }
  }
}


export function getTermNumber (termString: string): number {
  return parseInt(termString.replace(/[^\d]+/, '').replace(/[^\d].*/, ''));
}

export function getCourseName ($: CheerioStatic, code: string) {
  const codeAndName = $('td.classSearchMinorHeading').first().text().trim();
  const name = codeAndName.replace(new RegExp(`^${code}`), '').trim();
  return name;
}

export function shouldSkipStream (data: StreamTableData) {
  // Skip streams which are closed for enrolment but not full
  if (!['open', 'full'].includes(data['Status'].toLowerCase())) {
    return true;
  }

  // Skip streams with zero capacity
  if (/\/\s*0/.test(data['Enrols/Capacity'])) {
    return true;
  }

  // Skip intensive courses
  if (data['Instruction Mode'].toLowerCase() === 'intensive mode') {
    return true;
  }

  return false;
}

export function shouldSkipTime (time: ClassTime) {
  if (weeksAreOutsideTerm(time.weeks)) {
    return true;
  }

  if (isIntensive(time.time)) {
    return true;
  }

  if (isOnWeekend(time.time)) {
    return true;
  }

  return false;
}

export function abbreviateDay (day: string): string {
  // Handle multiple days
  if (day.includes(' ')) {
    return day.split(/ +/g).map(abbreviateDay).join('');
  }

  if (day.length < 2) {
    return day;
  }
  day = day.toUpperCase().slice(0, 2);
  const mapping: { [day: string]: string } = {
    'MO': 'M',
    'TU': 'T',
    'WE': 'W',
    'TH': 'H',
    'FR': 'F',
    'SA': 'S',
    'SU': 's',
  };
  return mapping[day];
}

export function shortenTime (time: string) {
  time = time.replace(/:30/g, '.5');
  const [start, end] = time.split(/\s*-\s*/).map(t => parseFloat(t));
  if (end - start === 1) {
    return start.toString();
  } else {
    return `${start}-${end}`;
  }
}

export function splitLocation (locationString: string): [string | undefined, string | undefined] {
  const bracketPos = locationString.indexOf('(');

  let name: string;
  let gridRef: string;
  if (bracketPos !== -1) {
    name = locationString.slice(0, bracketPos).trim();
    gridRef = locationString.slice(bracketPos - 1).trim().replace(/^\(|\)$/g, '');
  } else {
    name = locationString;
    gridRef = '';
  }

  if (name.toLowerCase() === 'see school') {
    name = '';
  }

  return [name || undefined, gridRef || undefined];
}

export function getComponent (data: StreamTableData) {
  if (isCourseEnrolment(data)) {
    return data['Section'];
  } else {
    return getShortActivity(data['Activity']);
  }
}

export function getShortActivity (activity: string) {
  const mapping: { [long: string]: string } = {
    'tutorial-laboratory': 'TLB',
  };
  const short = mapping[activity.toLowerCase()] || activity.slice(0, 3).toUpperCase();
  return short;
}

export function getEnrols (enrolmentString: string) {
  return enrolmentString.split(/\s*\/\s*/).map(x => parseInt(x)) as [number, number];
}

export function getIsWeb (section: string) {
  return section.toUpperCase().startsWith('WEB') || undefined;
}

export function getIsFull (status: string) {
  return status.toLowerCase() === 'full' || undefined;
}

export function weeksAreOutsideTerm (weeks?: string) {
  return weeks && /^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks);
}

export function isIntensive (time: string) {
  return time.replace(/[^a-z].*/i, '').length > 1;
}

export function isOnWeekend (time: string) {
  return time.replace(/[^a-z].*/i, '').toLowerCase().includes('s');
}

export function isCourseEnrolment (data: StreamTableData) {
  return data['Activity'].toLowerCase() === 'course enrolment';
}
