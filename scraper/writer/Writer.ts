export abstract class Writer {
  abstract async write (data: any, backup?: boolean): Promise<number>;
  abstract async read (): Promise<any>;
}

export default Writer;
