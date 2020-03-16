import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import indigo from '@material-ui/core/colors/indigo';

export const theme = createMuiTheme({
  palette: {
    primary: { main: indigo[600] },
    secondary: { main: '#1976D2' },
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
