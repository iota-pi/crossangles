export interface AllCampusConfig {
  [campus: string]: CampusConfig,
}

export interface CampusConfig {
  dataURI: string,
  name: string,
  longname: string,
}

export const campusConfig: AllCampusConfig = {
  "unsw": {
    "dataURI": "/data.json",
    "name": "UNSW",
    "longname": "University of New South Wales",
  },
};

export default campusConfig;
