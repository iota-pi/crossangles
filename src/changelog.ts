export interface LogEntry {
  date: Date,
  summary: string,
  id: number,
}

const rawChangelog: Omit<LogEntry, 'id'>[] = [
  {
    date: new Date(2021, 1, 17),
    summary: 'Improved drag-and-drop experience',
  },
  {
    date: new Date(2021, 1, 19),
    summary: 'Added changelog',
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
