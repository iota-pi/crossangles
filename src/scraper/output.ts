import { FileWriter } from './FileWriter'
import { Writer } from './Writer';

export const getWriter = (destination: string): Writer => {
  return new FileWriter(destination);
}
