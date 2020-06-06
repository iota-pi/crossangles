import { TimetableHistoryState } from '.';

export interface HistoryData {
  past: TimetableHistoryState[],
  present: TimetableHistoryState,
  future: TimetableHistoryState[],
}

export const undo = (history: HistoryData): HistoryData => {
  const { past, present, future } = history;
  return {
    past: [...past.slice(0, past.length - 1)],
    present: past[past.length - 1],
    future: [present, ...future],
  };
}

export const redo = (history: HistoryData): HistoryData => {
  const { past, present, future } = history;
  return {
    past: [...past, present],
    present: future[0],
    future: future.slice(1),
  };
}

export const push = (history: HistoryData, next: TimetableHistoryState): HistoryData => {
  const { past, present } = history;

  if (noStateChange(present, next)) {
    return history;
  }

  return {
    past: [...past, present],
    present: next,
    future: [],
  };
}

const noStateChange = (current: TimetableHistoryState, next: TimetableHistoryState) => {
  if (current.custom !== next.custom) {
    return false;
  }
  if (current.additional !== next.additional) {
    return false;
  }
  if (current.chosen !== next.chosen) {
    return false;
  }
  if (current.events !== next.events) {
    return false;
  }
  if (current.options !== next.options) {
    return false;
  }
  if (current.colours !== next.colours) {
    return false;
  }
  if (current.webStreams !== next.webStreams) {
    return false;
  }
  if (current.timetable !== next.timetable) {
    if (current.timetable.map.length !== next.timetable.map.length) {
      return false;
    }
    if (JSON.stringify(current.timetable.map) !== JSON.stringify(next.timetable.map)) {
      return false;
    }
  }

  return true;
}
