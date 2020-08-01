import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@material-ui/core';
import loadable from '@loadable/component';
import { RootState } from './state';
import { theme } from './theme';

const App = loadable(() => import('./AppWrapper'));
const StandaloneTimetable = loadable(() => import('./containers/StandaloneTimetable'));

export const AppContainer = () => {
  const darkMode = useSelector((state: RootState) => state.darkMode);

  return (
    <ThemeProvider theme={theme(darkMode)}>
      <Router>
        <Switch>
          <Route path="/timetable">
            <StandaloneTimetable />
          </Route>
          <Route path="/">
            <App />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
};
export default AppContainer;
