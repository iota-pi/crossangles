import { SessionData } from '../../state';
import { getHours } from './getHours';

const baseSession: Omit<SessionData, 'start' | 'end'> = {
  course: '',
  stream: '',
  day: 'M',
  index: 0,
};


it('returns expected defaults', () => {
  expect(getHours([])).toEqual({ start: 11, end: 18 });
});

it('keeps minimum value with one session', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 17, end: 20 },
  ];
  expect(getHours(sessions)).toEqual({ start: 11, end: 20 });
});

it('keeps minimum value with two sessions', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 12, end: 13 },
    { ...baseSession, start: 17, end: 20 },
  ];
  expect(getHours(sessions)).toEqual({ start: 11, end: 20 });
});

it('keeps maximum value with one session', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 8, end: 11 },
  ];
  expect(getHours(sessions)).toEqual({ start: 8, end: 18 });
});

it('keeps maximum value with two sessions', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 9, end: 10 },
    { ...baseSession, start: 11, end: 12 },
  ];
  expect(getHours(sessions)).toEqual({ start: 9, end: 18 });
});

it('correctly handles a single long session', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 9, end: 20 },
  ];
  expect(getHours(sessions)).toEqual({ start: 9, end: 20 });
});

it('correctly handles multiple days', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 12, end: 13, day: 'M' },
    { ...baseSession, start: 17, end: 20, day: 'T' },
    { ...baseSession, start: 9, end: 11, day: 'W' },
    { ...baseSession, start: 10, end: 11, day: 'F' },
  ];
  expect(getHours(sessions)).toEqual({ start: 9, end: 20 });
});

it('rounds half-hours correctly', () => {
  const sessions: SessionData[] = [
    { ...baseSession, start: 10.5, end: 12 },
    { ...baseSession, start: 17.5, end: 18.5 },
  ];
  expect(getHours(sessions)).toEqual({ start: 10, end: 19 });
});
