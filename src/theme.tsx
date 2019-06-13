import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import indigo from '@material-ui/core/colors/indigo';

export const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: {
      main: '#2979ff',
    },
  },
  typography: {},
});

export default theme;