import {
  TOGGLE_EVENT,
  TOGGLE_OPTION,
  ToggleOptionAction,
  EventAction,
} from '../actions/selection';
import {
  AdditionalEvent, baseState,
} from '../state';
import { OtherAction } from '../actions';
import { Options } from '../state/Options';

export function events (state: AdditionalEvent[] = [], action: EventAction | OtherAction): AdditionalEvent[] {
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

export function options (
  state: Options = baseState.options,
  action: ToggleOptionAction | OtherAction
): Options {
  switch (action.type) {
    case TOGGLE_OPTION:
      return {
        ...state,
        [action.option]: !state[action.option],
      };
  }

  return state;
};
