import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import indigo from '@material-ui/core/colors/indigo';

export const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: {
      main: '#1976D2',
    },
  },
  typography: {},
});

export default theme;