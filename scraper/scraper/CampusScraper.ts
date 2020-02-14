import { CourseData } from '../../src/state/Course';
import { MinistryMeta, Meta } from '../../src/state/Meta';
import LocalCache from './LocalCache';
import cheerio from 'cheerio';
import async from 'async';
import axios from 'axios';

export interface CampusData {
  courses: CourseData[],
  meta: Meta,
}

export abstract class CampusScraper {
  protected abstract readonly additional: CourseData[];
  protected abstract readonly meta: MinistryMeta;
  abstract readonly source: string;
  abstract readonly output: string;
  abstract readonly name: string;
  maxRequests: number = 10;
  cache?: LocalCache;
  logging = true;

  abstract async scrape (): Promise<CampusData>;

  generateMetaData (term: number): Meta {
    const zfill = (x: string | number, n = 2) => x.toString().padStart(n, '0');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    return {
      term,
      year: term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear,
      updateDate: `${zfill(currentDay)}/${zfill(currentMonth + 1)}/${currentYear}`,
      updateTime: `${zfill(now.getHours())}:${zfill(now.getMinutes())}`,
      source: this.source,
      signup: process.env.SIGN_UP || '',
      ...this.meta,
    };
  }

  protected async scrapePages (urls: string[], handler: (page: CheerioStatic) => void) {
    await async.mapLimit(
      urls,
      this.maxRequests,
      url => this.getPageContent(url, handler),
    );
  }

  private async getPageContent (url: string, handler: (page: CheerioStatic) => void) {
    let content: string;
    if (this.cache && this.cache.has(url)) {
      content = this.cache.get(url);
    } else {
      const response = await axios.get<string>(url);
      content = response.data;

      if (this.cache) {
        this.cache.set(url, content);
      }
    }

    const page = cheerio.load(content);
    handler(page);
  }

  log (...args: any[]) {
    if (this.logging) {
      console.log(`${this.name}:`, ...args);
    }
  }
}
