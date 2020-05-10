import { LinkedSession, SessionData } from '../../state';

export interface HourSpan {
  start: number,
  end: number,
}

export const getHours = (sessions: Array<LinkedSession | SessionData>): HourSpan => {
  let start = 11;
  let end = 18;

  for (let session of sessions) {
    if (session.start < start) {
      start = Math.floor(session.start);
    }
    if (session.end > end) {
      end = Math.ceil(session.end);
    }
  }

  return { start, end };
}

export default getHours;
