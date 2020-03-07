import { SessionManagerData } from './components/Timetable/SessionManager';
import { ColourMap } from './state/Colours';
import { Options } from './state/Options';
import axios from 'axios';
import download from 'downloadjs';

export interface SaveAsImageData {
  timetable: SessionManagerData,
  colours: ColourMap,
  options: Options,
}


export const saveAsImage = async (imageData: SaveAsImageData) => {
  const result = await axios.post(process.env.REACT_APP_SAVE_IMAGE_ENDPOINT!, imageData);
  const type = result.headers['Content-Type'];
  if (type === 'image/png') {
    download(result.data.data, 'timetable.png', type);
  } else {
    console.error(result.data);
  }
}

export const parseJSONQueryString = (queryString: string) => {
  queryString = (queryString.startsWith('?')) ? queryString.substr(1) : queryString;
  const keyValuePairs = queryString.split('&');
  const results: { [key: string]: any } = {};
  for (const pair of keyValuePairs) {
    const parts = pair.split('=', 2);
    const key = parts[0];
    if (parts.length === 1) {
      if (key.length) {
        results[key] = true;
      }
    } else if (parts.length === 2) {
      const value = parts[1];
      try {
        results[key] = JSON.parse(decodeURIComponent(value));
      } catch (e) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Could not decode and parse as JSON:', value);
          console.error(e);
        }
      }
    }
  }

  return results;
}

export const parseQueryString = (queryString: string): SaveAsImageData => {
  const data = parseJSONQueryString(queryString);
  const { timetable, colours, options } = data;
  if (!timetable || !colours || !options) {
    throw new Error(`Missing some attributes in ${data}`);
  }
  return { timetable, colours, options };
}
