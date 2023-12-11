import { isUSYD } from '../getCampus';

export interface Options {
  compactView?: boolean,
  darkMode?: boolean,
  includeFull?: boolean,
  showEnrolments?: boolean,
  showLocations?: boolean,
  showWeeks?: boolean,
  showMode?: boolean,
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

const fullClassName = isUSYD() ? 'closed' : 'full';

const allTimetableOptions: OptionListItem[] = [
  { key: 'showLocations', title: 'Show Locations', visible: true },
  { key: 'showEnrolments', title: 'Show Enrolments', visible: !isUSYD() },
  { key: 'showWeeks', title: 'Show Weeks', visible: true },
  { key: 'showMode', title: 'Show Delivery Mode', visible: true },
  { key: 'includeFull', title: `Include ${fullClassName} classes`, visible: true },
];
export const timetableOptionList = filterOptionList(allTimetableOptions);

const allGeneralOptions: OptionListItem[] = [
  { key: 'compactView', title: 'Compact display', visible: true },
  { key: 'darkMode', title: 'Dark mode', visible: true },
  { key: 'reducedMotion', title: 'Reduced animations', visible: true },
];
export const generalOptionList = filterOptionList(allGeneralOptions);

export const exclusiveOptions: { [key in keyof Options]: OptionName[] } = {
  compactView: ['showMode'],
  showMode: ['compactView'],
};

export function getOption(options: Options, option: OptionName): boolean {
  return options[option] || false;
}

export function getDefaultDarkMode(): boolean {
  if (window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}
