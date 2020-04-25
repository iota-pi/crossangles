import { getCurrentTerm } from './Meta';

it('getCurrentTerm gives correct result', () => {
  expect(getCurrentTerm({ term: 1, year: 1980 })).toBe('1980~1');
  expect(getCurrentTerm({ term: 2, year: 2000 })).toBe('2000~2');
  expect(getCurrentTerm({ term: 3, year: 2222 })).toBe('2222~3');
});
