import { isUSYD } from '../getCampus';

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
export interface OptionListItem {
  key: OptionName,
  title: string,
  visible: boolean,
}
export type OptionTuple = [OptionName, string];

function filterOptionList(options: OptionListItem[]): OptionTuple[] {
  return options.filter(o => o.visible !== false).map(o => {
    const tuple: OptionTuple = [o.key, o.title];
    return tuple;
  });
}

const allTimetableOptions: OptionListItem[] = [
  { key: 'showLocations', title: 'Show Locations', visible: true },
  { key: 'showEnrolments', title: 'Show Enrolments', visible: !isUSYD() },
  { key: 'showWeeks', title: 'Show Weeks', visible: true },
  { key: 'includeFull', title: 'Include full classes', visible: !isUSYD() },
];
export const timetableOptionList = filterOptionList(allTimetableOptions);

const allGeneralOptions: OptionListItem[] = [
  { key: 'compactView', title: 'Compact Display', visible: true },
  { key: 'darkMode', title: 'Dark Mode', visible: true },
  { key: 'reducedMotion', title: 'Reduced Animations', visible: true },
];
export const generalOptionList = filterOptionList(allGeneralOptions);

export function getOption(options: Options, option: OptionName): boolean {
  return options[option] || false;
}
