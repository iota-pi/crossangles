import { Writer } from './Writer';
import { writeFileSync, readFileSync } from 'fs';


export class FileWriter implements Writer {
  constructor (
    private readonly destination: string,
  ) {}

  async write (data: any, createBackup = true) {
    const json = JSON.stringify(data);

    if (createBackup) {
      this.createBackup(json);
    }

    writeFileSync(this.destination, json, 'utf-8');
  }

  async read () {
    const data = readFileSync(this.destination, 'utf-8');
    return JSON.parse(data);
  }

  toString () {
    return `<FileWriter { destination: "${this.destination}" }>`;
  }

  private getBackupFilePath () {
    const d = new Date();
    const year = '' + d.getFullYear();
    const month = ('' + (d.getMonth() + 1)).padStart(2, '0');
    const day = ('' + d.getDate()).padStart(2, '0');
    const fname = this.destination.replace(/\.json$/, '');
    return `${fname}-${year}-${month}-${day}.json`;
  }

  private createBackup (content: string) {
    const backupPath = this.getBackupFilePath();
    writeFileSync(backupPath, content, 'utf-8');
  }
}

export default FileWriter;
