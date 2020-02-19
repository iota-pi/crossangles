import SessionManager from '../components/Timetable/SessionManager';
import { getClashInfo } from './getClashInfo';
import { TimetableScorer } from './scoreTimetable';

export const getSessionManagerScore = (sessionManager: SessionManager) => {
  const allStreams = sessionManager.orderSessions.map(s => s.stream);
  const streamIds = allStreams.map(s => s.id);
  const uniqueStreams = allStreams.filter((s, i) => streamIds.indexOf(s.id) === i);

  const clashInfo = getClashInfo(uniqueStreams);
  const score = new TimetableScorer(clashInfo, []).score(uniqueStreams);
  return score;
}
