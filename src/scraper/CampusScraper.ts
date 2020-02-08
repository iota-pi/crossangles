import * as Apify from 'apify';
import { CourseData } from '../state/Course';
import { MinistryMeta, Meta } from '../state/Meta';

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

  protected async scrapePages (urls: string[], handler: (result: any) => any) {
    const requestList = new Apify.RequestList({
      sources: urls.map(url => ({ url })),
    });
    await requestList.initialize();

    const crawler = new Apify.CheerioCrawler({
      requestList,
      handlePageFunction: handler,
    });
    await crawler.run();
  }

  log (...args: any[]) {
    console.log(`${this.name}:`, ...args);
  }
}
