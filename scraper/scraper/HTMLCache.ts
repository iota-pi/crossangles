import { writeFileSync, readFileSync } from "fs";

export class HTMLCache {
  private data: Map<string, string>;

  constructor () {
    this.data = new Map();
  }

  set (key: string, value: string): void {
    this.data.set(key, value);
  }

  has (key: string): boolean {
    return this.data.has(key);
  }

  get (key: string): string {
    return this.data.get(key);
  }

  async write (destination: string) {
    const arrayData = Array.from(this.data);
    arrayData.sort((a, b) => +(a > b) - +(a < b))
    const json = JSON.stringify(arrayData);
    writeFileSync(destination, json, 'utf-8');
  }

  async load (source: string) {
    const json = readFileSync(source, 'utf-8');
    const data: [string, string][] = JSON.parse(json);
    this.data = new Map(data);
  }
}

export default HTMLCache;
