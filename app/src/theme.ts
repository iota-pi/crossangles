import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import indigo from '@material-ui/core/colors/indigo';
import lightBlue from '@material-ui/core/colors/blue';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';

export const theme = (dark = false) => {
  let palette: PaletteOptions;
  if (dark) {
    palette = {
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
  return createMuiTheme({
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
