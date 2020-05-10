import axios from 'axios';
import download from 'downloadjs';
import { ColourMap, Options } from './state';
import { SessionManagerData } from './components/Timetable/SessionManager';
import { TIMETABLE_BORDER_WIDTH, TIMETABLE_CELL_HEIGHT } from './components/Timetable/timetableUtil';
import getHours from './components/Timetable/getHours';

export interface SaveAsImageData {
  timetable: SessionManagerData,
  colours: ColourMap,
  options: Options,
}

export interface Viewport {
  width: number,
  height: number,
}

export interface SaveAsImageRequest extends SaveAsImageData {
  viewport: Viewport,
  campus: string,
}


export const getScreenshotViewport = (timetable: SessionManagerData): Viewport => {
  return {
    width: getScreenshotWidth(),
    height: getScreenshotHeight(timetable),
  };
}

export const getScreenshotWidth = (): number => {
  // Match width in screenshot to the width in the actual timetable
  const borderSpace = TIMETABLE_BORDER_WIDTH * 2;
  const timetable = document.getElementById('timetable-display');
  const width = timetable ? timetable.scrollWidth + borderSpace : 912;
  return width;
}

export const getScreenshotHeight = (timetable: SessionManagerData): number => {
  // Get height based off number of timetable rows
  const borderSpace = TIMETABLE_BORDER_WIDTH * 2;
  const sessions = timetable.map.map(([_, s]) => s.session);
  const hours = getHours(sessions);
  const duration = hours.end - hours.start;
  const rows = 1 + duration;
  const height = rows * TIMETABLE_CELL_HEIGHT + borderSpace;
  return height;
}

export const saveAsImage = async (imageData: SaveAsImageRequest) => {
  const { data } = await axios.post(process.env.REACT_APP_SAVE_IMAGE_ENDPOINT!, imageData);
  if (!data.error) {
    const mime = 'image/png';
    const image = `data:${mime};base64,${data.data}`;
    const filename = 'timetable.png';
    return download(image, filename, mime) === true;
  } else {
    console.error(data);
    return false;
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
