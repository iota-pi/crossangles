import React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { StateHistory } from '../state/StateHistory';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';

const styles = (theme: Theme) => createStyles({
  primary: {
    transition: 'color ease 0.3s',
    color: theme.palette.primary.main,
  },
  amber: {
    transition: 'color ease 0.3s',
    color: theme.palette.warning.main,
  },
  red: {
    transition: 'color ease 0.3s',
    color: theme.palette.error.main,
  },
});

export interface Props extends WithStyles<typeof styles> {
  history: StateHistory,
  improvementScore: number,
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
  improvementScore,
}: Props) => {
  let updateClass = classes.primary;
  if (improvementScore > 100) {
    if (improvementScore < 800) {
      updateClass = classes.amber;
    } else {
      updateClass = classes.red;
    }
  }

  return (
    <Toolbar>
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
          onClick={onUpdate}
          className={updateClass}
          data-cy="update-button"
        >
          <Refresh />
        </IconButton>
      )}
    </Toolbar>
  )
}

export default withStyles(styles)(TimetableControls);
