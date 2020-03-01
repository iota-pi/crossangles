export interface AllCampusConfig {
  [campus: string]: CampusConfig,
}

export interface CampusConfig {
  dataPath: string,
  name: string,
  longname: string,
}

export const dataDomain = process.env.NODE_ENV === 'production' ? 'https://d1aa8o4hf8f3x4.cloudfront.net/' : '/';

export const campusConfig: AllCampusConfig = {
  "unsw": {
    dataPath: "unsw/data.json",
    name: "UNSW",
    longname: "University of New South Wales",
  },
};
campusConfig.next = campusConfig.unsw;

export default campusConfig;
