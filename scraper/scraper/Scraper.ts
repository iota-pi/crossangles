import axios from 'axios';
import cheerio from 'cheerio';
import AsyncQueue from './AsyncQueue';
import HTMLCache from './HTMLCache';
import { CourseData, Meta } from '../../app/src/state';

export interface CampusData {
  campus: string,
  courses: CourseData[],
  meta: Meta,
  current: boolean,
}

export class Scraper {
  maxRequests: number = 5;
  cache: HTMLCache;

  constructor (cache?: HTMLCache) {
    this.cache = cache || new HTMLCache();
  }

  async scrapePages<T> (urls: string[], handler: (page: CheerioStatic) => Promise<T>) {
    const queue = new AsyncQueue<string, T>(this.maxRequests);
    queue.enqueue(urls);
    const processor = async (url: string) => handler(await this.getPageContent(url));
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
