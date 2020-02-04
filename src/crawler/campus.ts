import { UNSWCrawler } from './UNSWCrawler';
import { CampusCrawler } from './CampusCrawler';

class CampusError extends Error {
  readonly name = 'CampusError';

  toString () {
    return `${this.name}: ${this.message}`;
  }
}

export const getCampusCrawler = (campus: string): CampusCrawler => {
  switch (campus.toLowerCase()) {
    case 'unsw':
      return new UNSWCrawler();
  }

  throw new CampusError(`No crawler found for ${campus}`);
}
