import { Scraper } from '../Scraper';
import { CourseData } from '../../../app/src/state/Course';
import { StateManager } from '../../state/StateManager';
import getStateManager from '../../state/getStateManager';
import { removeDuplicateStreams } from './commonUtils';
import { getLogger } from '../../logging';
import ClassUtilParser from './ClassUtilParser';
import { UNSW } from './scrapeUNSW';

const logger = getLogger('ClassUtilScraper', { campus: UNSW });


export interface ClassUtilScraperConfig {
  scraper?: Scraper,
  parser?: ClassUtilParser,
  state?: StateManager | null,
}


export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);

const CACHE_KEY = 'classutil_last_data';
const UPDATE_TIME_KEY = 'classutil_update_time';

export const CLASSUTIL = 'http://classutil.unsw.edu.au';

export class ClassUtilScraper {
  scraper: Scraper;
  parser: ClassUtilParser;
  state: StateManager | undefined;
  readonly campus = 'unsw';
  facultyPages: string[] = [];
  maxFaculties = process.env.NODE_ENV === 'test' ? 1 : Infinity;

  protected dataUpdateTime: string | null | undefined = null;

  constructor({ scraper, parser, state }: ClassUtilScraperConfig = {}) {
    this.scraper = scraper || new Scraper();
    this.parser = parser || new ClassUtilParser();
    this.state = state === undefined ? getStateManager() : state || undefined;
  }

  async setup() {
    this.facultyPages = await this.findFacultyPages();

    if (!await this.checkIfDataUpdated()) {
      logger.info('data has not been updated yet');
      return false;
    }

    return true;
  }

  async scrape(term: number): Promise<CourseData[]> {
    this.checkTerm(term);

    logger.info(`scraping term ${term} from ${CLASSUTIL}`);
    const termLinkEnd = `${term}.html`;
    const facultyPages = this.facultyPages.filter(l => l.endsWith(termLinkEnd));
    const results = await this.scrapeFacultyPages(facultyPages);
    logger.info('Persisting results to DynamoDB');
    await this.persistState(results, term);
    logger.info('Finished persisting results to DynamoDB');
    this.scraper.report();
    return results;
  }

  getCacheKey(term: number) {
    return `${CACHE_KEY}_term_${term}`;
  }

  async getCache(term: number): Promise<CourseData[]> {
    if (this.state) {
      const cacheKey = this.getCacheKey(term);
      return await this.state.getBlob(this.campus, cacheKey) || [];
    }
    return [];
  }

  async persistState(result: CourseData[], term: number) {
    if (this.state) {
      await this.state.set(this.campus, UPDATE_TIME_KEY, this.dataUpdateTime);
      logger.info(`${UPDATE_TIME_KEY} set to "${this.dataUpdateTime}"`);

      const cacheKey = this.getCacheKey(term);
      await this.state.setBlob(this.campus, cacheKey, result);
    }
  }

  async checkIfDataUpdated() {
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

  private getUpdateTime($: CheerioStatic) {
    const timeText = $('p>strong').text();
    // Remove timezone because it confuses parsers and is inconsistent
    const withoutTZ = timeText.replace(/\bA?E[SD]T\b/, '');
    this.dataUpdateTime = withoutTZ.replace(/\s\s{1,20}/g, ' ');
  }

  private async findFacultyPages() {
    const links: string[] = [];
    const linkRegex = /[A-Y][A-Z]{3}_[ST][0-9]\.html$/i;
    await this.scraper.scrapePages([CLASSUTIL], async $ => {
      const allLinks = Array.from($('a')).map(e => $(e).attr('href') || '');
      const matchingLinks = allLinks.filter(link => linkRegex.test(link));
      links.push(...matchingLinks);

      this.getUpdateTime($);
    });

    links.length = Math.min(links.length, this.maxFaculties);

    logger.info(`found ${links.length} faculty pages`);
    return links;
  }

  private async scrapeFacultyPages(pages: string[]) {
    const urls = pages.map(page => `${CLASSUTIL}/${page}`);
    const results = await this.scraper.scrapePages(
      urls, page => this.parser.parseFacultyPage(page),
    );
    const allCourses = results.flat();

    // Remove duplicate streams from each course
    for (const course of allCourses) {
      removeDuplicateStreams(course);
    }

    // Sort courses for consistency
    allCourses.sort(courseSort);

    logger.info(`parsed ${allCourses.length} courses`);
    return allCourses;
  }

  checkTerm(term: number) {
    if (term < 1 || term > 3) {
      throw new Error(`ClassUtilScraper does not support scraping term ${term}`);
    }
  }
}

export default ClassUtilScraper;

