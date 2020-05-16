import axios, { AxiosResponse } from 'axios';
import handbookPayload from './HandbookRequest';

export type CourseNameMap = { [code: string]: string };

export const fetchHandbookNames = async (): Promise<CourseNameMap> => {
  const endpoint = 'https://www.handbook.unsw.edu.au/api/es/search';
  let handbook: AxiosResponse<any>;
  try {
    handbook = await axios.post(endpoint, handbookPayload);
  } catch (error) {
    console.error(error);
    return {};
  }

  const mapping: CourseNameMap = {};
  for (const course of handbook.data['contentlets']) {
    const code = course['code'] as string;
    const name = course['name'] as string;
    mapping[code] = name;
  }

  return mapping;
}
