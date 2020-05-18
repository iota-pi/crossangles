import { Scraper } from '../Scraper';
import { ClassTime, CourseData, StreamData } from '../../../app/src/state';
import StateManager from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import $ from 'cheerio';

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const UPDATE_TIME_KEY = 'timetable_update_time';

export const TIMETABLE_UNSW = 'http://timetable.unsw.edu.au';

export interface TimetableScraperConfig {
  scraper?: Scraper,
  state?: StateManager,
  year?: number,
}

export class TimetableScraper {
  scraper: Scraper;
  protected state: StateManager;
  readonly campus = 'unsw';
  maxFaculties = Infinity;
  facultyPages: string[] = [];
  logging = process.env.NODE_ENV !== 'test';
  baseURL: string;
  year: number;

  protected dataUpdateTime: string | undefined;

  constructor ({ scraper, state, year }: TimetableScraperConfig = {}) {
    this.scraper = scraper || new Scraper();
    this.state = state || getStateManager();
    this.year = year || new Date().getFullYear();
    this.baseURL = `${TIMETABLE_UNSW}/2020`;
  }

  async setup () {
    this.facultyPages = await this.findFacultyPages();

    if (await this.checkIfDataUpdated()) {
      this.log('data has not been updated yet; nothing to do');
      return false;
    }

    return true;
  }

  async scrape () {
    this.log(`scraping from ${TIMETABLE_UNSW}`);
    const coursePages = await this.scrapeFacultyPages();
    const result = await this.scrapeCoursePages(coursePages);
    return result;
  }

  async checkIfDataUpdated () {
    // Update data if source has changed
    const lastUpdateTime = await this.state.get(this.campus, UPDATE_TIME_KEY);
    if (lastUpdateTime !== this.dataUpdateTime) {
      return true;
    }

    return false;
  }

  async persistState () {
    if (this.state) {
      this.state.set(this.campus, UPDATE_TIME_KEY, this.dataUpdateTime);
      this.log(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);
    }
  }

  private getUpdateTime ($: CheerioStatic) {
    let timeText = $('td.note:contains("Data is correct as at")').text();
    timeText = timeText.replace('Data is correct as at ', '');

    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    console.log(withoutTZ);
    this.dataUpdateTime = withoutTZ;
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

    uniqueLinks.length = 1;

    this.log(`found ${uniqueLinks.length} courses`);
    return uniqueLinks;
  }

  private async scrapeCoursePages (pages: string[]) {
    const urls = pages.map(page => `${this.baseURL}/${page}`);
    const courses: CourseData[] = [];
    const courseCodeRegex = /([A-Z]{4}[0-9]{4})/i;
    await this.scraper.scrapePages(urls, async ($, url) => {
      const code = (courseCodeRegex.exec(url) || [])[1];
      const course: CourseData = {
        code,
        name: '',
        streams: [],
      };

      const table_selector = 'body > table tr > td > table tr:nth-child(6) > td > table td.formBody > table';
      const term_tables = $(table_selector).filter(':has(:contains("Class Nbr"))').toArray();

      for (const term_table of term_tables) {
        const data = await this.parseTable($(term_table));
        if (shouldSkipStream(data['Status'])) {

        }

        const stream: StreamData = {
          component: getShortActivity(data['Activity']),
          enrols: getEnrols(data['Enrols/Capacity']),
          full: getIsFull(data['Status']),
          web: getIsWeb(data['Section']),
          times: [],
        };
      }

      courses.push(course);
    });

    this.log(`parsed ${courses.length} courses`);
    return courses;
  }

  private async parseTable (table: Cheerio) {
    const labels = table.find('td.label').toArray().map(element => $(element).text().trim());
    const data = table.find('td.data').toArray().map(element => $(element).text().trim());
    const mapping: { [key: string]: string } = {};
    for (let i = 0; i < labels.length; i++) {
      mapping[labels[i]] = data[i];
    }
    return mapping;
  }

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.campus.toUpperCase()}:`, ...args);
    }
  }
}


export function splitLocation (locationString: string): [string, string] {
  const bracketPos = locationString.indexOf('(');
  const name = locationString.slice(0, bracketPos).trim();
  const gridRef = locationString.slice(bracketPos - 1).trim();
  return [name, gridRef];
}

export function getShortActivity (activity: string) {
  const mapping: { [long: string]: string } = {
    'tutorial-laboratory': 'TLB',
  };
  const short = mapping[activity.toLowerCase()] || activity.slice(0, 3).toUpperCase();
  return short;
}

export function shouldSkipStream (status: string) {
  const allowedStatuses = ['open', 'full'];
  return allowedStatuses.includes(status);
}

export function getEnrols (enrolmentString: string) {
  return enrolmentString.split(/\s*\/\s*/).map(x => parseInt(x)) as [number, number];
}

export function getIsWeb (section: string) {
  return section.toUpperCase().startsWith('WEB');
}

export function getIsFull (status: string) {
  return status.toLowerCase() === 'full';
}


const test = async () => {
  const timetable = new TimetableScraper();
  timetable.maxFaculties = 1;
  await timetable.setup();
  const result = await timetable.scrape();
  console.log(result);
}
test();
