import { SessionManagerData } from './components/Timetable/SessionManager';


export const getBaseTimetableURI = () => {
  return window.location.origin + '/timetable';
}

export const getQueryString = (timetable: SessionManagerData) => {
  const pairs = Object.entries(timetable).map(x => {
    const key = x[0];
    const value = encodeURIComponent(JSON.stringify(x[1]));
    return `${key}=${value}`;
  });
  return ((pairs.length > 0) ? '?' : '') + pairs.join('&');
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

export const parseQueryString = (queryString: string): SessionManagerData => {
  const timetable = parseJSONQueryString(queryString) as SessionManagerData;
  return timetable;
}
