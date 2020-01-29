import { CourseData } from "../state/Course";
import { MinistryMeta } from "../state/Meta";

export type Campus = "unsw" | "usyd";

export interface CampusData {
  data: CourseData[],
  meta: MinistryMeta,
  source: string,
  output: string,
}

export const getCampusData = (campus: Campus): CampusData => {
  switch (campus) {
    case "unsw":
      return {
        data: require('../../src/assets/additional-cbs.json'),
        meta: require('../../src/assets/info-cbs.json'),
        source: 'https://nss.cse.unsw.edu.au/sitar/classes2019',
        output: './public/data.json',
      }
  }

  throw new Error(`Unknown campus: ${campus}`);
}
