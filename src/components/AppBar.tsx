import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import InvertColors from '@material-ui/icons/InvertColors';
import InvertColorsOff from '@material-ui/icons/InvertColorsOff';
import AppOptions from './AppOptions';
import AboutCrossAngles from './AboutCrossAngles';
import { RootState } from '../state';
import { getOptions } from '../state/selectors';
import { toggleOption } from '../actions';
import { useMediaQuery, useTheme } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  term: {
    marginRight: theme.spacing(1),
    fontWeight: 300,
    fontSize: '1.1rem',
  },
  termNumber: {
    fontWeight: 500,
  },
}));

export interface Props {
  onShowContact: () => void,
  onViewChangelog: () => void,
}


export function CrossAnglesAppBar({
  onShowContact,
  onViewChangelog,
}: Props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { darkMode } = useSelector(getOptions);
  const { term, year } = useSelector((state: RootState) => state.meta);
  const handleClickDarkMode = React.useCallback(
    () => dispatch(toggleOption('darkMode')),
    [dispatch],
  );

  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <AppBar
      position="fixed"
      color={darkMode ? 'secondary' : 'primary'}
    >
      <Toolbar>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          CrossAngles
        </Typography>

        <Tooltip
          title={
            `Course data is for Term ${term}, ${year}. `
            + 'CrossAngles will automatically update when the data for the next term becomes available.'
          }
        >
          <Typography color="inherit" className={classes.term}>
            {!xs && 'Term '}
            <span className={classes.termNumber}>
              {xs && 'T'}
              {term}
            </span>
            {!xs && year}
          </Typography>
        </Tooltip>

        <IconButton onClick={handleClickDarkMode} color="inherit">
          {darkMode ? (
            <InvertColorsOff />
          ) : (
            <InvertColors />
          )}
        </IconButton>

        <AboutCrossAngles onShowContact={onShowContact} />
        <AppOptions onViewChangelog={onViewChangelog} />
      </Toolbar>
    </AppBar>
  );
}

export default CrossAnglesAppBar;
