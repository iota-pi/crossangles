export interface AllCampusConfig {
  [campus: string]: CampusConfig,
}

export interface CampusConfig {
  dataPath: string,
  name: string,
  longname: string,
}

export const DATA_ROOT_URI = process.env.REACT_APP_DATA_ROOT_URI || '';

export const campusConfig: AllCampusConfig = {
  unsw: {
    dataPath: `${DATA_ROOT_URI}/unsw/data.json`,
    name: 'UNSW',
    longname: 'University of New South Wales',
  },
};

export default campusConfig;
