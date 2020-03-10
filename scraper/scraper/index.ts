import { UNSWScraper } from './UNSWScraper';
import { CampusScraper } from './CampusScraper';

class CampusError extends Error {
  readonly name = 'CampusError';

  toString () {
    return `${this.name}: ${this.message}`;
  }
}

export const getCampusScraper = async (campus: string): Promise<CampusScraper> => {
  switch (campus.toLowerCase()) {
    case 'unsw':
      return await UNSWScraper.create();
  }

  throw new CampusError(`No scraper found for ${campus}`);
}
