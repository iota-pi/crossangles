import { CampusData } from './CampusScraper';
import { Writer } from './Writer';
import { writeFileSync } from 'fs';


export class FileWriter implements Writer {
  constructor (
    private readonly destination: string,
  ) {}

  async write (data: CampusData, backup = true) {
    const json = JSON.stringify(data);

    if (backup) {
      this.backup(json)
    }

    writeFileSync(this.destination, json, 'utf-8');
  }

  toString () {
    return `<FileWriter { destination: "${this.destination}" }>`
  }

  private getBackupFilePath () {
    const d = new Date();
    const year = '' + d.getFullYear();
    const month = ('' + (d.getMonth() + 1)).padStart(2, '0');
    const day = ('' + d.getDate()).padStart(2, '0');
    const fname = this.destination.replace(/\.json$/, '');
    return `${fname}-${year}-${month}-${day}.json`;
  }

  private backup (content: string) {
    const backupPath = this.getBackupFilePath();
    writeFileSync(backupPath, content, 'utf-8');
  }
}
