import axios from 'axios';
import config from './campusConfig';
import getCampus from './getCampus';
import { CourseData, Meta } from './state';


export interface CampusData {
  courses: CourseData[],
  meta: Meta,
}


export async function requestData(): Promise<CampusData> {
  const campus = getCampus();
  const uri = config[campus].dataPath;
  const { data } = await axios.get(uri);
  return data;
}

export default requestData;
