export interface LogEntry {
  date: Date,
  summary: string,
  details?: string[],
  boring?: boolean,
  id: number,
}

const rawChangelog: Omit<LogEntry, 'id'>[] = [
  {
    date: new Date(2021, 1, 17),
    summary: 'Improved drag-and-drop',
    details: [
      'Timetable preview',
      'Improve clarity for overlapping streams',
      'General quality of life updates',
    ],
  },
  {
    date: new Date(2021, 1, 19),
    summary: 'Added changelog',
  },
  {
    date: new Date(2021, 2, 20),
    summary: 'Bugfixes',
    details: [
      'Dark mode toggle for browsers running in dark mode',
      'Rare issue affecting timetable generation',
    ],
    boring: true,
  },
  {
    date: new Date(2021, 3, 20),
    summary: 'Customisable auto-timetabling',
    details: [
      'Accessible through settings menu',
    ],
  },
];

const changelog: LogEntry[] = rawChangelog.map((item, i) => ({ ...item, id: i })).reverse();

export default changelog;

export function getUpdateMessage(updateCount: number) {
  const n = updateCount === 1 ? 'A' : updateCount.toString();
  const s = updateCount === 1 ? '' : 's';
  const have = updateCount === 1 ? 'has' : 'have';
  const choices: string[] = [];
  if (updateCount === 1) {
    choices.push(
      'CrossAngles just got even better!',
    );
  } else {
    choices.push(
      `${n} new update${s} just landed!`,
      `There ${have} been ${n} new update${s}`,
    );
  }
  return choices[Math.floor(Math.random() * choices.length)];
}
