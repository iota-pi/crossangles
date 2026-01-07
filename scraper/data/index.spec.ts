import getAdditional from '.';

it('getAdditional default data', () => {
  expect(getAdditional('unsw').length).toBeGreaterThan(0);
});

it('getAdditional default and non-existent term are identical', () => {
  const defaultData = getAdditional('unsw');
  const termData = getAdditional('unsw', '!!this is not a real or valid term!!');
  expect(defaultData).toEqual(termData);
});
