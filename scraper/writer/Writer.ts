export abstract class Writer {
  abstract write(data: any, backup?: boolean): Promise<number>
  abstract read(): Promise<any>
}

export default Writer
