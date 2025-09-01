import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { Scraper } from '../Scraper';
import type { CourseData } from '../../../app/src/state/Course';
import { ClassTime, DeliveryType, StreamData } from '../../../app/src/state/Stream';
import StateManager from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import { removeDuplicateStreams } from '../commonUtils';
import { getLogger } from '../../logging';
import { UNSW } from './scrapeUNSW';
import axios from '../axios';
import { COURSE_COLOURS } from '../../../app/src/state/Colours';

const logger = getLogger('TimetableScraper', { campus: UNSW });

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const UPDATE_TIME_KEY = 'timetable_update_time';
const CACHE_KEY = 'timetable_last_data';

export const TIMETABLE_UNSW = 'https://timetable.unsw.edu.au';
const ROOT_PAGE = '/subjectSearch.html';

export interface TimetableScraperConfig {
  state?: StateManager | null,
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
  'Mode of Delivery': string,
  'Consent': string,
  'Meeting Information': string,
  'Class Notes': string,
}

export class TimetableScraper {
  scraper: Scraper;
  state: StateManager | undefined;
  readonly uni = UNSW;
  maxFaculties = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  maxCourses = process.env.NODE_ENV === 'test' ? 1 : Infinity;
  facultyPages: string[] = [];
  baseURL: string;
  facultyLinkFilter?: (links: string[]) => string[];

  protected dataUpdateTime: string | null | undefined = null;

  constructor({ state }: TimetableScraperConfig = {}) {
    this.scraper = new Scraper();
    this.scraper.logger = logger;
    this.state = state === undefined ? getStateManager() : state || undefined;
    this.baseURL = `${TIMETABLE_UNSW}`;
  }

  async setup() {
    await this.updateBaseURL();
    this.facultyPages = await this.findFacultyPages();

    if (!await this.checkIfDataUpdated()) {
      logger.info('data has not been updated yet');
      return false;
    }

    return true;
  }

  async scrape(): Promise<CourseData[][]> {
    logger.info(`scraping from ${TIMETABLE_UNSW}`);
    const coursePages = await this.scrapeFacultyPages();
    const result = await this.scrapeCoursePages(coursePages);
    logger.info('persisting state to DynamoDB');
    await this.persistState(result);
    logger.info('finished persisting state to DynamoDB');
    this.scraper.report();
    return result;
  }

  async getCache(): Promise<CourseData[][]> {
    if (this.state) {
      return await this.state.getBlob(this.uni, CACHE_KEY) || [];
    }
    return [];
  }

  async persistState(result: CourseData[][]) {
    if (this.state) {
      await this.state.set(this.uni, UPDATE_TIME_KEY, this.dataUpdateTime);
      logger.info(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);
      await this.state.setBlob(this.uni, CACHE_KEY, result);
    }
  }

  async checkIfDataUpdated() {
    // Can't check update time, presume has been updated since last scrape
    if (!this.state) {
      return true;
    }

    // Update data if source has changed
    const lastScrapeTime = await this.state.get(this.uni, UPDATE_TIME_KEY);
    logger.info(`Last successful update was recorded at ${lastScrapeTime}`);
    if (lastScrapeTime !== this.dataUpdateTime) {
      return true;
    }

    return false;
  }

  private async updateBaseURL() {
    const response = await axios.get(this.baseURL);
    const responseURL = response.request.res.responseUrl;
    if (!responseURL) {
      logger.warn(`Could not update base URL. Will use default: ${this.baseURL}`);
      return;
    }
    this.baseURL = responseURL.replace(/\/[^/]*\.html$/i, '');
    logger.info(`Updated base URL to: ${this.baseURL}`);
  }

  private getUpdateTime($: cheerio.CheerioAPI) {
    let timeText = $('td.note:contains("Data is correct as at")').text();
    timeText = timeText.replace(/Data is correct as at/i, '').trim();

    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    this.dataUpdateTime = withoutTZ.replace(/\s\s{1,20}/g, ' ').trim();
    logger.info(`Data update time detected as "${this.dataUpdateTime}"`);
  }

  private async findFacultyPages() {
    const links: string[] = [];
    const linkRegex = /[A-Y][A-Z]{3}(KENS|COFA)\.html$/i;
    await this.scraper.scrapePages([`${this.baseURL}${ROOT_PAGE}`], async $ => {
      const pageLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = pageLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);

      this.getUpdateTime($);
    });

    const uniqueLinks = links.filter((link, i) => links.indexOf(link) === i);
    uniqueLinks.length = Math.min(uniqueLinks.length, this.maxFaculties);

    logger.info(`found ${uniqueLinks.length} faculty pages`);
    return uniqueLinks;
  }

  private async scrapeFacultyPages() {
    const urls = this.facultyPages.map(page => `${this.baseURL}/${page}`);
    const links: string[] = [];
    const linkRegex = /[A-Z]{4}[0-9]{4}\.html$/i;
    await this.scraper.scrapePages(urls, async $ => {
      const pageLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = pageLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);
    });

    let uniqueLinks = links.filter((link, i) => links.indexOf(link) === i);
    if (this.facultyLinkFilter) {
      uniqueLinks = this.facultyLinkFilter(uniqueLinks);
    }
    uniqueLinks.length = Math.min(uniqueLinks.length, this.maxCourses);

    logger.info(`found ${uniqueLinks.length} course pages`);
    return uniqueLinks;
  }

  private async scrapeCoursePages(pages: string[]) {
    const urls = pages.map(page => `${this.baseURL}/${page}`);
    const allCourses: CourseData[][] = [[], [], []];
    const courseCodeRegex = /([A-Z]{4}[0-9]{4})/i;
    await this.scraper.scrapePages(urls, async ($, url) => {
      const code = (courseCodeRegex.exec(url) || [])[1];
      const name = getCourseName($, code);
      const getBaseCourse = (): CourseData => ({ code, name, streams: [] });
      const courses: CourseData[] = [
        getBaseCourse(),
        getBaseCourse(),
        getBaseCourse(),
      ];

      const streamTables = $('td.label:contains("Class Nbr")').parent().parent();
      for (const streamTable of streamTables) {
        const data = this.parseTable($, streamTable);
        if (shouldSkipStream(data)) {
          continue;
        }
        const stream: StreamData = {
          component: getComponent(data),
          delivery: getDelivery(data['Mode of Delivery']),
          enrols: getEnrols(data['Enrols/Capacity']),
          full: getIsFull(data.Status),
          notes: data['Class Notes'] || undefined,
          offering: data['Offering Period'],
          times: [],
          web: getIsWeb(data.Section),
        };

        const timesRows = $(streamTable).find('table tr:has(td.data)').toArray();
        for (const row of timesRows) {
          const cells = $(row).children('td.data').toArray().map(e => $(e).text().trim());
          const [day, time, location, weeks] = cells;
          const timeStr = abbreviateDay(day) + shortenTime(time);
          const locationName = splitLocation(location)[0];
          let timeObject: ClassTime = {
            time: timeStr,
            location: locationName || undefined,
            weeks,
          };

          if (!shouldSkipTime(timeObject)) {
            (stream.times as ClassTime[]).push(timeObject);
          }
        }

        // Skip regular streams without any associated class times
        const isRegularStream = !stream.web;
        if ((stream.times as ClassTime[]).length === 0 && isRegularStream) {
          continue;
        }

        // Get term number or skip courses which don't have a definable number
        const term = getTermNumber(data['Teaching Period']);
        if (term === undefined) {
          continue;
        }
        if (term < 1 || term > 3) {
          logger.info(`Skipping ${code}; term "${term}" is not in expected range 1..3`);
          continue;
        }

        const course: CourseData = courses[term - 1];
        course.streams.push(stream);
      }

      for (let term = 0; term < courses.length; ++term) {
        const course = courses[term];
        removeDuplicateStreams(course);
        removeDuplicateTimes(course, term)
        
        allCourses[term].push(course);
      }
    });
    
    return allCourses;
  }

  private parseTable($: cheerio.CheerioAPI, table: Element): StreamTableData {
    const tableAPI = $(table);
    const allLabels = tableAPI.find('td.label').toArray().map(
      element => $(element).text().trim(),
    );
    const labels = allLabels.filter(l => l.toLowerCase() !== 'meeting information');
    const data = tableAPI.children('tr').children('td.data').toArray().map(
      element => $(element).text().trim(),
    );
    const mapping: Partial<StreamTableData> = {};
    for (let i = 0; i < labels.length; i++) {
      mapping[labels[i] as keyof StreamTableData] = data[i] || '';
    }
    return mapping as StreamTableData;
  }
}


export function getTermNumber(termString: string): number | undefined {
  // we don't have any support for online hexamester courses
  if (termString.includes('Hexamester ')) {
    return undefined;
  }

  const term = parseInt(termString.replace(/[^\d]+/, '').replace(/[^\d].*/, ''));
  if (Number.isNaN(term)) {
    return undefined;
  }
  return term;
}

export function getCourseName($: cheerio.CheerioAPI, code: string) {
  const codeAndName = $('td.classSearchMinorHeading').first().text().trim();
  const name = codeAndName.replace(new RegExp(`^${code}`), '').trim();
  return name;
}

export function shouldSkipStream(data: StreamTableData) {
  // Skip streams which are closed for enrolment but not full
  if (!['open', 'full'].includes(data.Status.toLowerCase())) {
    return true;
  }

  // Skip streams with zero capacity
  if (/\/\s*0/.test(data['Enrols/Capacity'])) {
    return true;
  }

  // Skip intensive courses
  if (data['Mode of Delivery'].toLowerCase() === 'intensive mode') {
    return true;
  }

  // Skip course enrolment streams
  if (isCourseEnrolment(data)) {
    return true;
  }

  return false;
}

export function shouldSkipTime(time: ClassTime) {
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

export function abbreviateDay(day: string): string {
  // Handle multiple days
  if (day.includes(' ')) {
    return day.split(/ +/g).map(abbreviateDay).join('');
  }

  if (day.length < 2) {
    return day;
  }
  const shortDay = day.toUpperCase().slice(0, 2);
  const mapping: { [abbrev: string]: string } = {
    MO: 'M',
    TU: 'T',
    WE: 'W',
    TH: 'H',
    FR: 'F',
    SA: 'S',
    SU: 's',
  };
  return mapping[shortDay];
}

export function shortenTime(time: string) {
  const [start, end] = time.replace(/:30/g, '.5').split(/\s*-\s*/).map(t => parseFloat(t));
  if (end - start === 1) {
    return start.toString();
  }
  return `${start}-${end}`;
}

export function splitLocation(locationString: string): [string | undefined, string | undefined] {
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

export function getComponent(data: StreamTableData) {
  if (isCourseEnrolment(data)) {
    return data.Section;
  }
  return getShortActivity(data.Activity);
}

export function getShortActivity(activity: string) {
  const mapping: { [long: string]: string } = {
    'tutorial-laboratory': 'TLB',
  };
  let short = mapping[activity.toLowerCase()] || activity.slice(0, 3).toUpperCase();
  const sequenceNumber = activity.match(/([0-9]+) of ([0-9]+)/)?.[1];
  if (sequenceNumber) {
    short = short.slice(0, 2) + sequenceNumber;
  }
  return short;
}

export function getEnrols(enrolmentString: string) {
  return enrolmentString.split(/\s*\/\s*/).map(x => parseInt(x)) as [number, number];
}

export function getDelivery(_mode: string): DeliveryType | undefined {
  const mode = _mode.toLowerCase();
  if (mode.includes('person')) {
    return DeliveryType.person;
  } else if (mode.includes('web')) {
    return DeliveryType.online;
  }
  return undefined;
}

export function getIsWeb(section: string) {
  return section.toUpperCase().startsWith('WEB') || undefined;
}

export function getIsFull(status: string) {
  return status.toLowerCase() === 'full' || undefined;
}

export function weeksAreOutsideTerm(weeks?: string) {
  return weeks && /^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks);
}

export function isIntensive(time: string) {
  return time.replace(/[^a-z].*/i, '').length > 1;
}

export function isOnWeekend(time: string) {
  return time.replace(/[^a-z].*/i, '').toLowerCase().includes('s');
}

export function isCourseEnrolment(data: StreamTableData) {
  return data.Activity.toLowerCase() === 'course enrolment';
}

export function removeDuplicateTimes(course: CourseData, term: number) {
  if (course.streams[term] && course.streams[term].times && Array.isArray(course.streams[term].times)) {
    const seen: Map<string, ClassTime> = new Map();
    const courseTimesInTerm = course.streams[term].times;

    for (let i = 0; i < courseTimesInTerm.length; i++) { 
      let curTime = courseTimesInTerm[i];
      let key = `${curTime.time}-${curTime.location}`;
      if (!curTime.weeks) continue;
      let curWksStr: string = curTime.weeks; 

      if (seen.has(key)) {
        // check if it exists already
        let toUpdate: ClassTime | undefined = seen.get(key);
        if(toUpdate == undefined) continue;

        // if we ever add a method that reduces weeks then we can get rid of this.
        if (!seen.get(key)?.weeks?.includes(curWksStr)) {
          toUpdate.weeks = `${toUpdate.weeks},${curWksStr}`;
          seen.set(key, toUpdate);
        }
      } else {
        seen.set(key, {...curTime});
      }
    }
    course.streams[term].times = Array.from(seen.values());
  }
}
