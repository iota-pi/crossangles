import cheerio from 'cheerio';
import axios from './axios';
import AsyncQueue from './AsyncQueue';
import HTMLCache from './HTMLCache';
import { CourseData } from '../../app/src/state/Course';
import { Meta } from '../../app/src/state/Meta';
import { getLogger } from '../logging';

const logger = getLogger('Scraper');


export interface CampusData {
  campus: string,
  courses: CourseData[],
  meta: Meta,
  current: boolean,
}

export class Scraper {
  maxRequests: number = 10;
  cache: HTMLCache;

  constructor (cache?: HTMLCache) {
    this.cache = cache || new HTMLCache();
  }

  async scrapePages<T> (urls: string[], handler: (page: CheerioStatic, url: string) => Promise<T>) {
    const queue = new AsyncQueue<string, T>(this.maxRequests);
    queue.enqueue(urls);
    const processor = async (url: string) => {
      const content = await this.getPageContent(url).catch(error => {
        logger.error(`Error while fetching "${url}":`, error);
        return null;
      });
      if (content === null) return null;

      return handler(content, url).catch(error => {
        logger.error(`Error while scraping "${url}":`, error);
        return null;
      });
    };
    const parsingPromises = await queue.run(processor);
    return await Promise.all(parsingPromises);
  }

  async getPageContent (url: string) {
    let content: string;
    let loadedFromCache = false;
    if (this.cache.has(url)) {
      content = this.cache.get(url)!;
      loadedFromCache = true;
    } else {
      const response = await axios.get<string>(url);
      content = response.data;
    }

    const page = cheerio.load(content);

    if (!loadedFromCache) {
      this.cache.set(url, page.html());
    }

    return page;
  }
}
