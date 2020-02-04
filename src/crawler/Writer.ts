import { CampusData } from './CampusCrawler';

export abstract class Writer {
  abstract async write (data: CampusData, backup?: boolean): Promise<void>;
}
