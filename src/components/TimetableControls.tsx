import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Refresh from '@material-ui/icons/Refresh';
import Warning from '@material-ui/icons/Warning';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import Event from '@material-ui/icons/Event';
import { useSelector } from 'react-redux';
import { HistoryData, RootState } from '../state';

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
    cursor: 'pointer',
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
  isSavingImage: boolean,
  timetableIsEmpty: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  onUpdate?: () => void,
  onIncludeFull?: () => void,
  onSaveAsImage?: () => void,
  onCreateCustom?: () => void,
}

export const TimetableControls = ({
  history,
  improvementScore,
  isUpdating,
  isSavingImage,
  timetableIsEmpty,
  onUndo,
  onRedo,
  onUpdate,
  onIncludeFull,
  onSaveAsImage,
  onCreateCustom,
}: Props) => {
  const classes = useStyles();
  let updateClass = classes.primary;
  if (improvementScore > 100) {
    if (improvementScore < 800) {
      updateClass = classes.amber;
    } else {
      updateClass = classes.red;
    }
  }
  const unplacedCount = useSelector((state: RootState) => state.unplacedCount);
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.key === 'z') {
          if (onUndo && canUndo) onUndo();
        }

        if (event.key === 'Z' || event.key === 'y') {
          if (onRedo && canRedo) onRedo();
        }
      }
    },
    [onUndo, onRedo, canUndo, canRedo],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const classesPlural = unplacedCount === 1 ? 'class is' : 'classes are';
  const fullClassMessage = `${unplacedCount} full ${classesPlural} not visible`;

  return (
    <Toolbar>
      {onUndo && (
        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={onUndo}
              color="primary"
              disabled={!canUndo}
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
              disabled={!canRedo}
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

      <div className={classes.spacer} />

      {unplacedCount > 0 && (
        <Tooltip title={fullClassMessage}>
          <ButtonBase
            className={classes.unplacedCountContainer}
            onClick={onIncludeFull}
          >
            <span className={classes.unplacedCount}>{unplacedCount}</span>
            <Warning />
          </ButtonBase>
        </Tooltip>
      )}

      {onSaveAsImage && (
        <Tooltip title="Save as Image">
          <span>
            <IconButton
              onClick={onSaveAsImage}
              color="primary"
              disabled={isSavingImage}
              data-cy="save-as-image"
            >
              {isSavingImage ? (
                <CircularProgress size={24} />
              ) : (
                <CameraAltIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}

      {onCreateCustom && (
        <Tooltip title="Create Personal Event">
          <IconButton
            onClick={onCreateCustom}
            color="primary"
            data-cy="create-custom-event"
          >
            <Event />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

export default TimetableControls;
