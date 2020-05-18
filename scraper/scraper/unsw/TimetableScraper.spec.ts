import { splitLocation, getShortActivity } from './TimetableScraper';

describe('parsing utilities', () => {
  it('splitLocation', () => {
    const location = 'Science Theatre (K-F13-G09)';
    expect(splitLocation(location)).toEqual(['Science Theatre', '(K-F13-G09)'])
  })

  it.each`
    long                     | short
    ${'Tutorial-Laboratory'} | ${'TLB'}
  `('getShortActivity($long) = $short', ({ long, short }) => {
    expect(getShortActivity(long)).toEqual(short);
  })
})
