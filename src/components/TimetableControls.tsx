import React from 'react';
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

export interface Props extends WithStyles<typeof styles> {
  history: StateHistory,
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
}: Props) => {
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
          onClick={onUpdate}
          color="primary"
          data-cy="update-button"
        >
          <Refresh />
        </IconButton>
      )}
    </Toolbar>
  )
}

export default withStyles(styles)(TimetableControls);
