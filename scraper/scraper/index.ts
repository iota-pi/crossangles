import { UNSWScraper } from './UNSWScraper';
import { CampusScraper } from './CampusScraper';

class CampusError extends Error {
  readonly name = 'CampusError';

  toString () {
    return `${this.name}: ${this.message}`;
  }
}

export const getCampusScraper = (campus: string): CampusScraper => {
  switch (campus.toLowerCase()) {
    case 'unsw':
      return new UNSWScraper();
  }

  throw new CampusError(`No scraper found for ${campus}`);
}
