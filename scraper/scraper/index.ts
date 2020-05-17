import { ClassUtilScraper } from './unsw/ClassUtilScraper';
import { Scraper } from './Scraper';

class CampusError extends Error {
  readonly name = 'CampusError';

  toString () {
    return `${this.name}: ${this.message}`;
  }
}

export const getCampusScraper = async (campus: string): Promise<Scraper> => {
  switch (campus.toLowerCase()) {
    case 'unsw':
      return await ClassUtilScraper.create();
  }

  throw new CampusError(`No scraper found for ${campus}`);
}
