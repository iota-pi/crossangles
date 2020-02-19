import { getCampus, clearCampusCache } from './getCampus';

describe('getCampus', () => {
  beforeEach(() => {
    clearCampusCache();
  })

  it.each`
    hostname                       | campus_env | result
    ${'localhost'}                 | ${'unsw'}  | ${'unsw'}
    ${'localhost'}                 | ${'usyd'}  | ${'usyd'}
    ${'localhost:3000'}            | ${'unsw'}  | ${'unsw'}
    ${'localhost:3000'}            | ${'usyd'}  | ${'usyd'}
    ${'crossangles.app'}           | ${'unsw'}  | ${'unsw'}
    ${'crossangles.app'}           | ${'usyd'}  | ${'usyd'}
    ${'unsw.crossangles.app'}      | ${'unsw'}  | ${'unsw'}
    ${'usyd.crossangles.app'}      | ${'unsw'}  | ${'usyd'}
    ${'blah.usyd.crossangles.app'} | ${'unsw'}  | ${'usyd'}
    ${'unsw.usyd.crossangles.app'} | ${'unsw'}  | ${'usyd'}
  `('getCampus("$hostname") with default "$campus_env" = "$result"', ({ hostname, campus_env, result }) => {
    process.env.REACT_APP_DEFAULT_CAMPUS = campus_env;
    expect(getCampus(hostname)).toBe(result);
  })

  it('caches values', () => {
    expect(getCampus('unsw.crossangles.app')).toBe('unsw');
    expect(getCampus('usyd.crossangles.app')).toBe('unsw');
  })
})
