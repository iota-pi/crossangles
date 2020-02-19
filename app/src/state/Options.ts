export interface Options {
  showEnrolments?: boolean;
  showLocations?: boolean;
  showWeeks?: boolean;
  includeFull?: boolean;
}
export type OptionName = keyof Options;
export const OptionList = new Map<OptionName, string>([
  ['showEnrolments', 'Show Enrolments'],
  ['showLocations', 'Show Locations'],
  ['showWeeks', 'Show Weeks'],
  ['includeFull', 'Include full classes'],
]);
