import { writeFileSync, readFileSync } from 'fs';
import zlib from 'zlib';

export class HTMLCache {
  private data: Map<string, string>;
  private touched: boolean;

  constructor () {
    this.data = new Map();
    this.touched = false;
  }

  set (key: string, value: string): void {
    this.data.set(key, value);
    this.touched = true;
  }

  has (key: string): boolean {
    return this.data.has(key);
  }

  get (key: string): string | undefined {
    return this.data.get(key);
  }

  async write (destination: string, force = false) {
    if (this.touched || force) {
      const arrayData = Array.from(this.data);
      arrayData.sort((a, b) => +(a > b) - +(a < b));
      const json = zlib.brotliCompressSync(Buffer.from(JSON.stringify(arrayData)));
      writeFileSync(destination, json, 'utf-8');
    }
  }

  async load (source: string) {
    const json = zlib.brotliDecompressSync(readFileSync(source)).toString('utf-8');
    const data: [string, string][] = JSON.parse(json);
    this.data = new Map(data);
  }
}

export default HTMLCache;
