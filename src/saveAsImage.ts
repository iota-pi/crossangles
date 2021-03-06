import axios from 'axios';
import download from 'downloadjs';
import { ColourMap, Options } from './state';
import { SessionManagerData, getEmptySessionManagerData } from './components/Timetable/SessionManagerTypes';
import { getTimetableHeight, TIMETABLE_BORDER_WIDTH } from './components/Timetable/timetableUtil';
import { getHours } from './components/Timetable/getHours';

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


export function getScreenshotViewport(
  timetable: SessionManagerData,
  compact: boolean,
  showMode: boolean,
): Viewport {
  return {
    width: getScreenshotWidth(),
    height: getScreenshotHeight(timetable, compact, showMode),
  };
}

export function getScreenshotWidth(): number {
  // Match width in screenshot to the width in the actual timetable
  const borderSpace = TIMETABLE_BORDER_WIDTH * 2;
  const timetable = document.getElementById('timetable-display');
  const width = timetable ? timetable.scrollWidth + borderSpace : 912;
  return width;
}

export function getScreenshotHeight(
  timetable: SessionManagerData,
  compact: boolean,
  showMode: boolean,
): number {
  // Get height based off number of timetable rows
  const sessions = timetable.map.map(s => s[1].session);
  const hours = getHours(sessions);
  const duration = hours.end - hours.start;
  return getTimetableHeight(duration, compact, showMode) + TIMETABLE_BORDER_WIDTH;
}

export async function saveAsImage(imageData: SaveAsImageRequest) {
  const url = `${process.env.REACT_APP_SAVE_IMAGE_ENDPOINT}/${process.env.REACT_APP_STAGE_NAME}/`;

  const { data } = await axios.post(url, imageData);
  if (!data.error) {
    const mime = 'image/png';
    const image = `data:${mime};base64,${data.data}`;
    const filename = 'timetable.png';
    return download(image, filename, mime) === true;
  }
  console.error(data);
  return false;
}

export function parseJSONQueryString(queryString: string) {
  const query = queryString.startsWith('?') ? queryString.substr(1) : queryString;
  const keyValuePairs = query.split('&');
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

export function parseQueryString(queryString: string): SaveAsImageData {
  const data = parseJSONQueryString(queryString);
  const {
    timetable = getEmptySessionManagerData(),
    colours = {},
    options = {},
  } = data as Partial<SaveAsImageData>;
  return {
    timetable, colours, options,
  };
}
