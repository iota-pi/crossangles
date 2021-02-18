import changelog from './changelog';


it('changelog entries are in descending date order', () => {
  const sorted = changelog.slice().sort((a, b) => +(a.date < b.date) - +(a.date > b.date));
  expect(changelog).toEqual(sorted);
});
