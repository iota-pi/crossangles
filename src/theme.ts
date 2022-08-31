/* eslint-disable no-lonely-if */
import { createTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import green from '@material-ui/core/colors/green';
import lightBlue from '@material-ui/core/colors/blue';
import lightGreen from '@material-ui/core/colors/lightGreen';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { isUSYD } from './getCampus';

export const theme = (dark = false) => {
  let palette: PaletteOptions;
  if (isUSYD()) {
    if (dark) {
      palette = {
        // In dark theme, we swap the primary and secondary colours because some
        // Mui components don't allow switching from primary, but should use the
        // lighter colour
        secondary: { main: green[700] },
        primary: { main: lightGreen[400] },
        type: 'dark',
      };
    } else {
      palette = {
        primary: { main: green[800] },
        secondary: { main: lightGreen[500] },
      };
    }
  } else {
    if (dark) {
      palette = {
        // In dark theme, we swap the primary and secondary colours
        secondary: { main: indigo[500] },
        primary: { main: lightBlue[400] },
        type: 'dark',
      };
    } else {
      palette = {
        primary: { main: indigo[600] },
        secondary: { main: lightBlue[600] },
      };
    }
  }
  return createTheme({
    palette,
    overrides: {
      MuiSelect: {
        select: {
          '&:focus': {
            backgroundColor: 'none',
          },
        },
      },
      MuiIconButton: {
        sizeSmall: {
          padding: 6,
        },
      },
    },
    typography: {},
  });
};

export default theme;
