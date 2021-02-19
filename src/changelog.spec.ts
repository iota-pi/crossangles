import changelog from './changelog';


describe('changelog entry sanity', () => {
  it('is in descending date order', () => {
    const sorted = changelog.slice().sort((a, b) => +(a.date < b.date) - +(a.date > b.date));
    expect(changelog).toEqual(sorted);
  });

  it('is not future-dated', () => {
    expect(changelog[0].date < new Date()).toBe(true);
  });
});
