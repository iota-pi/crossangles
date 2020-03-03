import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import theme from './theme';

import loadable from '@loadable/component';
const App = loadable(() => import('./App'));
const StandaloneTimetable = loadable(() => import('./containers/StandaloneTimetable'));

ReactDOM.render(
  <ThemeProvider theme={theme}>
  <Router>
    <Switch>
      <Route path="/">
        <App />
      </Route>
    </Switch>
    </Router>
  </ThemeProvider>,
  document.getElementById('root')
);

