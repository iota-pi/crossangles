export interface Options {
  showEnrolments?: boolean;
  showLocations?: boolean;
  showWeeks?: boolean;
  includeFull?: boolean;
}
export type OptionName = keyof Options;
export const optionList: [OptionName, string][] = [
  ['showLocations', 'Show Locations'],
  ['showEnrolments', 'Show Enrolments'],
  ['showWeeks', 'Show Weeks'],
  ['includeFull', 'Include full classes'],
];
