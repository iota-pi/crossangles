import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { HistoryData } from '../state/StateHistory';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';
import Event from '@material-ui/icons/Event';

const useStyles = makeStyles(theme => ({
  primary: {
    transition: theme.transitions.create('color'),
    color: theme.palette.primary.main,
  },
  amber: {
    transition: theme.transitions.create('color'),
    color: theme.palette.warning.main,
  },
  red: {
    transition: theme.transitions.create('color'),
    color: theme.palette.error.main,
  },
  spacer: {
    flexGrow: 1,
  },
}));

export interface Props {
  history: HistoryData,
  improvementScore: number,
  isUpdating: boolean,
  timetableIsEmpty: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  onUpdate?: () => void,
  onCreateCustom?: () => void,
}

export const TimetableControls = ({
  history,
  improvementScore,
  isUpdating,
  timetableIsEmpty,
  onUndo,
  onRedo,
  onUpdate,
  onCreateCustom,
}: Props) => {
  const classes = useStyles()
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
        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={onUndo}
              color="primary"
              disabled={history.past.length === 0}
              data-cy="undo-button"
              >
              <Undo />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {onRedo && (
        <Tooltip title="Redo">
          <span>
            <IconButton
              onClick={onRedo}
              color="primary"
              disabled={history.future.length === 0}
              data-cy="redo-button"
            >
              <Redo />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {onUpdate && (
        <Tooltip title="Generate New Timetable">
          <span>
            <IconButton
              onClick={!isUpdating ? onUpdate : undefined}
              disabled={timetableIsEmpty}
              className={updateClass}
              data-cy="update-button"
            >
              <Refresh />
            </IconButton>
          </span>
        </Tooltip>
      )}

      <div className={classes.spacer}></div>

      {onCreateCustom && (
        <Tooltip title="Create Personal Event">
          <IconButton
            color="primary"
            onClick={onCreateCustom}
            data-cy="create-custom-event"
          >
            <Event />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  )
}

export default TimetableControls;
