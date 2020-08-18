import getAdditional from './additional';

it('getAdditional default data', () => {
  expect(getAdditional('unsw').length).toBeGreaterThan(0);
});

it('getAdditional default and non-existent term are identical', () => {
  const defaultData = getAdditional('unsw');
  const termData = getAdditional('unsw', '!!this is not a real or valid term!!');
  expect(defaultData).toEqual(termData);
});

it('getAdditional fills in details from default', () => {
  const defaultData = getAdditional('unsw');
  const termData = getAdditional('unsw', '2020~3');
  expect(termData[0].autoSelect).toEqual(defaultData[0].autoSelect);
  expect(termData[0].defaultColour).toEqual(defaultData[0].defaultColour);
  expect(termData[0].description).toEqual(defaultData[0].description);
  expect(termData[0].isAdditional).toEqual(defaultData[0].isAdditional);
});
