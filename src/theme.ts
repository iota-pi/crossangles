import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import indigo from '@material-ui/core/colors/indigo';

export const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: {
      main: '#1976D2',
    },
  },
  overrides: {
    MuiSelect: {
      select: {
        '&:focus': {
          backgroundColor: 'none',
        },
      },
    },
  },
  typography: {},
});

export default theme;
