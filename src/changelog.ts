export interface LogEntry {
  date: Date,
  summary: string,
  id: number,
}

const _changelog: Omit<LogEntry, 'id'>[] = [
  {
    date: new Date(2021, 1, 17),
    summary: 'Improved drag-and-drop experience',
  },
  {
    date: new Date(2021, 1, 18),
    summary: 'Added changelog',
  },
];

const changelog: LogEntry[] = _changelog.map((item, i) => ({ ...item, id: i })).reverse();

export default changelog;
