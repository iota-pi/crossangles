export interface AllCampusConfig {
  [campus: string]: CampusConfig,
}

export interface CampusConfig {
  dataPath: string,
  name: string,
  longname: string,
}

export const dataDomain = process.env.LOCAL_DATA === '1' ? '/' : 'https://d26ecwk4wivd8z.cloudfront.net/';

export const campusConfig: AllCampusConfig = {
  unsw: {
    dataPath: 'unsw/data.json',
    name: 'UNSW',
    longname: 'University of New South Wales',
  },
};
campusConfig.next = campusConfig.unsw;

export default campusConfig;
