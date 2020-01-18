import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { StateHistory } from '../state';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';

const styles = (theme: Theme) => createStyles({
  root: {
    // backgroundColor: theme.palette.primary.main,
    // color: theme.palette.primary.contrastText,
  },
});

const PULSE_DELAY = 1000;

export interface Props extends WithStyles<typeof styles> {
  history: StateHistory,
  shouldPulseUpdate?: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  onUpdate?: () => void,
}

export const TimetableControls = ({
  classes,
  history,
  onUndo,
  onRedo,
  onUpdate,
  shouldPulseUpdate,
}: Props) => {
  const [ doPulse, setDoPulse ] = useState(false);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (shouldPulseUpdate) {
      if (pulseTimer.current === null) {
        setDoPulse(true);
        pulseTimer.current = setTimeout(() => {
          pulseTimer.current = null;
        }, PULSE_DELAY);
      } else {
        clearTimeout(pulseTimer.current);
        pulseTimer.current = null;
      }
    }
  }, [shouldPulseUpdate]);
  useEffect(() => {
    if (pulseTimer.current) {
      clearTimeout(pulseTimer.current);
    }
  }, []);

  useEffect(() => {
    if (doPulse) {
      if (updateButton.current) {
        updateButton.current.click();
      }
      setDoPulse(false);
    }
  }, [doPulse])

  return (
    <Toolbar className={classes.root}>
      {onUndo && (
        <IconButton
          onClick={onUndo}
          color="primary"
          disabled={history.past.length === 0}
          data-cy="undo-button"
        >
          <Undo />
        </IconButton>
      )}
      {onRedo && (
        <IconButton
          onClick={onRedo}
          color="primary"
          disabled={history.future.length === 0}
          data-cy="redo-button"
        >
          <Redo />
        </IconButton>
      )}
      {onUpdate && (
        <IconButton
          onClick={doPulse ? undefined : onUpdate}
          color="primary"
          data-cy="update-button"
          ref={updateButton}
        >
          <Refresh />
        </IconButton>
      )}
    </Toolbar>
  )
}

export default withStyles(styles)(TimetableControls);
