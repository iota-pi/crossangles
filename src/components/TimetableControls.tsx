import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';
import Event from '@material-ui/icons/Event';
import Warning from '@material-ui/icons/Warning';
import { HistoryData, RootState } from '../state';
import { useSelector } from 'react-redux';

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
  unplacedCountContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.warning.main,
    marginRight: theme.spacing(1),
  },
  unplacedCount: {
    ...theme.typography.body1,
    fontWeight: 500,
    paddingRight: theme.spacing(0.25),
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
  const unplacedCount = useSelector((state: RootState) => state.unplacedCount);

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

      {unplacedCount > 0 && (
        <Tooltip title={`${unplacedCount} full classes`}>
          <div className={classes.unplacedCountContainer}>
            <span className={classes.unplacedCount}>{unplacedCount}</span>
            <Warning />
          </div>
        </Tooltip>
      )}

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
