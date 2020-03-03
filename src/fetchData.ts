import axios from 'axios';
import config, { dataDomain } from './campusConfig';
import getCampus from './getCampus';
import { CourseData } from './state/Course';
import { Meta } from './state/Meta';


export interface CampusData {
  courses: CourseData[],
  meta: Meta,
}


export const requestData = async (): Promise<CampusData> => {
  const campus = getCampus(window.location.hostname);
  const uri = dataDomain + config[campus].dataPath;
  const { data } = await axios.get(uri);
  return data;
}

export default requestData;
