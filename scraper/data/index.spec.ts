import getAdditional from '.';

it('getAdditional default data', () => {
  expect(getAdditional('unsw').length).toBeGreaterThan(0);
});

it('getAdditional default and non-existent term are identical', () => {
  const defaultData = getAdditional('unsw');
  const termData = getAdditional('unsw', '!!this is not a real or valid term!!');
  expect(defaultData).toEqual(termData);
});

// Test is no longer relevant while we are only using the 'default' key
// it('getAdditional fills in details from default', () => {
//   const defaultData = getAdditional('unsw');
//   const termData = getAdditional('unsw', '2020~3');
//   expect(termData[0].autoSelect).toEqual(defaultData[0].autoSelect);
//   expect(termData[0].defaultColour).toEqual(defaultData[0].defaultColour);
//   expect(termData[0].description).toEqual(defaultData[0].description);
//   expect(termData[0].isAdditional).toEqual(defaultData[0].isAdditional);
// });
