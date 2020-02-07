import { CampusData } from './CampusScraper';

export abstract class Writer {
  abstract async write (data: CampusData, backup?: boolean): Promise<void>;
}
