import { Action } from 'redux';

export const SET_DARK_MODE = 'SET_DARK_MODE';
export interface SetDarkModeAction extends Action {
  type: typeof SET_DARK_MODE,
  darkMode?: boolean,
}
export const setDarkMode = (darkMode?: boolean): SetDarkModeAction => ({
  type: SET_DARK_MODE,
  darkMode,
});
