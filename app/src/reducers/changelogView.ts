import { AllActions, SET_CHANGELOG_VIEW } from '../actions';
import { initialState } from '../state';

export function changelogView(
  state: Date | undefined,
  action: AllActions,
): Date {
  if (action.type === SET_CHANGELOG_VIEW) {
    return new Date();
  }

  return state || initialState.changelogView;
}

export default changelogView;
