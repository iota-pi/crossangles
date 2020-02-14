import { CampusData } from '../scraper/CampusScraper';

export abstract class Writer {
  abstract async write (data: CampusData, backup?: boolean): Promise<void>;
}

export default Writer;
