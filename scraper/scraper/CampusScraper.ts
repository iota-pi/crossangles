import { CourseData } from '../../app/src/state/Course';
import { Meta } from '../../app/src/state/Meta';
import AsyncQueue from './AsyncQueue';
import HTMLCache from './HTMLCache';
import cheerio from 'cheerio';
import axios from 'axios';
import StateManager from '../state/StateManager';
import getAEST from '../getAEST';

export interface CampusData {
  campus: string,
  courses: CourseData[],
  meta: Meta,
  current: boolean,
}

export abstract class CampusScraper {
  abstract readonly campus: string;
  maxRequests: number = 5;
  logging = true;

  protected abstract state: StateManager;
  cache?: HTMLCache;

  abstract async scrape (): Promise<CampusData[] | null>;

  generateMetaData (term: number, source: string): Meta {
    const zfill = (x: string | number, n = 2) => x.toString().padStart(n, '0');
    const now = getAEST();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    return {
      year: term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear,
      term,
      source,
      updateDate: `${zfill(currentDay)}/${zfill(currentMonth + 1)}/${currentYear}`,
      updateTime: `${zfill(now.getHours())}:${zfill(now.getMinutes())}`,
      signup: process.env.SIGN_UP || '',
    };
  }

  protected async scrapePages<T> (urls: string[], handler: (page: CheerioStatic) => Promise<T>) {
    const queue = new AsyncQueue<string, T>(this.maxRequests);
    queue.enqueue(urls);
    const processor = async (url: string) => handler(await this.getPageContent(url));
    const parsingPromises = await queue.run(processor);
    return await Promise.all(parsingPromises);
  }

  private async getPageContent (url: string) {
    let content: string;
    let loadedFromCache = false;
    if (this.cache && this.cache.has(url)) {
      content = this.cache.get(url)!;
      loadedFromCache = true;
    } else {
      const response = await axios.get<string>(url);
      content = response.data;
    }

    const page = cheerio.load(content);

    if (!loadedFromCache && this.cache) {
      this.cache.set(url, page.html());
    }

    return page;
  }

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.campus.toUpperCase()}:`, ...args);
    }
  }
}
