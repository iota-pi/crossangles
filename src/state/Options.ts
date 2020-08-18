export interface Options {
  compactView?: boolean,
  darkMode?: boolean,
  includeFull?: boolean;
  showEnrolments?: boolean;
  showLocations?: boolean;
  showWeeks?: boolean;
  reducedMotion?: boolean,
  twentyFourHours?: boolean,
}
export type OptionName = keyof Options;
export type OptionList = [OptionName, string][];
export const timetableOptionList: OptionList = [
  ['showLocations', 'Show Locations'],
  ['showEnrolments', 'Show Enrolments'],
  ['showWeeks', 'Show Weeks'],
  ['includeFull', 'Include full classes'],
];
export const generalOptionList: OptionList = [
  ['compactView', 'Compact Display'],
  ['darkMode', 'Dark Mode'],
  ['reducedMotion', 'Reduced Animations'],
];

export function getOption(options: Options, option: OptionName): boolean {
  return options[option] || false;
}
