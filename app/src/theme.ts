import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import indigo from '@material-ui/core/colors/indigo';

export const theme = (dark = false) => createMuiTheme({
  palette: {
    primary: { main: dark ? indigo[700] : indigo[600] },
    secondary: { main: '#1976D2' },
    type: dark ? 'dark' : 'light',
  },
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

export default theme;
