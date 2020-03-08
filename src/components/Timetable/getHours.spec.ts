import { SessionData } from '../../state/Session';
import { getHours } from './getHours';

it('returns expected defaults', () => {
  expect(getHours([])).toEqual({ start: 11, end: 18 });
})

it('keeps minimum value', () => {
  const sessions: SessionData[] = [
    {
      course: '',
      stream: '',
      day: 'M',
      index: 0,
      start: 12,
      end: 13,
    },
    {
      course: '',
      stream: '',
      day: 'M',
      index: 0,
      start: 17,
      end: 20,
    },
  ];
  expect(getHours(sessions)).toEqual({ start: 11, end: 20 });
})

it('keeps maximum value', () => {
  const sessions: SessionData[] = [
    {
      course: '',
      stream: '',
      day: 'M',
      index: 0,
      start: 9,
      end: 10,
    },
    {
      course: '',
      stream: '',
      day: 'M',
      index: 0,
      start: 11,
      end: 12,
    },
  ];
  expect(getHours(sessions)).toEqual({ start: 9, end: 18 });
})
