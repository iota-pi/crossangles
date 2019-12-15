import {
  TOGGLE_EVENT,
  TOGGLE_OPTION,
  ToggleOptionAction,
  EventAction,
} from '../actions/selection';
import {
  baseEvents,
  baseOptions,
  CBSEvent,
  Options,
} from '../state';

export function events (state = baseEvents, action: EventAction): CBSEvent[] {
  switch (action.type) {
    case TOGGLE_EVENT:
      if (!state.includes(action.event)) {
        return [
          ...state,
          action.event,
        ];
      } else {
        const i = state.indexOf(action.event);
        return [
          ...state.slice(0, i),
          ...state.slice(i + 1),
        ];
      }
  }

  return state;
};

export function options (state = baseOptions, action: ToggleOptionAction): Options {
  switch (action.type) {
    case TOGGLE_OPTION:
      return {
        ...state,
        [action.option]: !state[action.option],
      };
  }

  return state;
};
