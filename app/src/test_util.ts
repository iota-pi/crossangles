import { CourseData } from './state/Course'
import { linkStream } from './state/Stream';
import SessionPlacement from './components/Timetable/SessionPlacement';
import SessionManager from './components/Timetable/SessionManager';

export const getCourse = (): CourseData => ({
  code: 'RING9731',
  name: 'Introduction to Ring Theory',
  streams: [
    {
      component: 'LEC',
      enrols: [50, 100],
      times: [
        { time: 'M9', location: 'Morder', canClash: true },
        { time: 'H19', location: 'Helm\'s Deep', weeks: '1,3,7-9' }],
    },
    {
      component: 'TUT',
      enrols: [5, 10],
      times: [
        { time: 'H9', location: 'Hobbiton' },
      ],
    },
    {
      component: 'TUT',
      enrols: [9, 9],
      times: [
        { time: 'F12', location: 'Fangorn' },
      ],
    },
  ],
});

export const getLinkedStream = (streamIndex = 0) => {
  const course = getCourse();
  return linkStream(course, course.streams[streamIndex]);
}

export const getLinkedSession = (streamIndex = 0, sessionIndex = 0) => {
  const stream = getLinkedStream(streamIndex);
  return stream.sessions[sessionIndex];
}

export const getSessionPlacement = (streamIndex = 0, sessionIndex = 0): SessionPlacement => {
  const session = getLinkedSession(streamIndex, sessionIndex);
  return new SessionPlacement(session);
}

export const getSessionManager = () => {
  const manager = new SessionManager();
  const p1 = getSessionPlacement(0);
  const p2 = getSessionPlacement(1);
  const p3 = getSessionPlacement(2);
  manager.set(p1.session.id, p1);
  manager.set(p2.session.id, p2);
  manager.set(p3.session.id, p3);
  return manager;
}
