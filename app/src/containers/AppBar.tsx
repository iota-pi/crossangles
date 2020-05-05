import React from 'react';
import createStyles from '@material-ui/core/styles/createStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { AboutCrossAngles } from '../components/AboutCrossAngles';
import InvertColors from '@material-ui/icons/InvertColors';
import InvertColorsOff from '@material-ui/icons/InvertColorsOff';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => {
  return createStyles({
    grow: {
      flexGrow: 1,
    },
  });
});

export interface Props {
  darkMode: boolean,
  onShowContact: () => void,
  onToggleDarkMode: (darkMode?: boolean) => void,
};


export function CrossAnglesAppBar({
  darkMode,
  onShowContact,
  onToggleDarkMode,
}: Props) {
  const classes = useStyles();

  return (
    <AppBar
      position="absolute"
      color={darkMode ? "secondary" : "primary"}
    >
      <Toolbar>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          CrossAngles
        </Typography>

        <IconButton onClick={() => onToggleDarkMode()} color="inherit">
          {darkMode ? (
            <InvertColorsOff />
          ) : (
            <InvertColors />
          )}
        </IconButton>

        <AboutCrossAngles onShowContact={onShowContact} />
      </Toolbar>
    </AppBar>
  );
}

export default CrossAnglesAppBar;
