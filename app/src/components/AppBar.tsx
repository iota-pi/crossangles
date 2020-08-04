import React from 'react';
import createStyles from '@material-ui/core/styles/createStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InvertColors from '@material-ui/icons/InvertColors';
import InvertColorsOff from '@material-ui/icons/InvertColorsOff';
import { makeStyles } from '@material-ui/core';
import { AppOptions } from './AppOptions';
import { AboutCrossAngles } from './AboutCrossAngles';
import { useSelector, useDispatch } from 'react-redux';
import { getOptions } from '../state/selectors';
import { toggleOption } from '../actions';

const useStyles = makeStyles(() => createStyles({
  grow: {
    flexGrow: 1,
  },
}));

export interface Props {
  onShowContact: () => void,
}


export function CrossAnglesAppBar({
  onShowContact,
}: Props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { darkMode } = useSelector(getOptions);
  const handleClickDarkMode = React.useCallback(
    () => dispatch(toggleOption('darkMode')),
    [dispatch],
  );

  return (
    <AppBar
      position="fixed"
      color={darkMode ? 'secondary' : 'primary'}
    >
      <Toolbar>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          CrossAngles
        </Typography>

        <IconButton onClick={handleClickDarkMode} color="inherit">
          {darkMode ? (
            <InvertColorsOff />
          ) : (
            <InvertColors />
          )}
        </IconButton>

        <AboutCrossAngles onShowContact={onShowContact} />
        <AppOptions />
      </Toolbar>
    </AppBar>
  );
}

export default CrossAnglesAppBar;
