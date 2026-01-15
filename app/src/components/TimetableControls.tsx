import { makeStyles } from 'tss-react/mui'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Undo from '@mui/icons-material/Undo'
import Redo from '@mui/icons-material/Redo'
import Refresh from '@mui/icons-material/Refresh'
import Warning from '@mui/icons-material/Warning'
import EventIcon from '@mui/icons-material/Event'
import { useSelector } from 'react-redux'
import { HistoryData, RootState } from '../state'
import { useCallback, useEffect } from 'react'

const useStyles = makeStyles()(theme => ({
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
    ...(theme.typography.body1 as any),
    fontWeight: 500,
    paddingRight: theme.spacing(0.25),
  },
}))

export interface Props {
  history: HistoryData,
  improvementScore: number,
  isUpdating: boolean,
  timetableIsEmpty: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  onUpdate?: () => void,
  onIncludeFull?: () => void,
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
  onIncludeFull,
  onCreateCustom,
}: Props) => {
  const { classes } = useStyles()
  let updateClass = classes.primary
  if (improvementScore > 100) {
    if (improvementScore < 800) {
      updateClass = classes.amber
    } else {
      updateClass = classes.red
    }
  }
  const unplacedCount = useSelector((state: RootState) => state.unplacedCount)
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        if (event.key === 'z') {
          if (onUndo && canUndo) onUndo()
        }

        if (event.key === 'Z' || event.key === 'y') {
          if (onRedo && canRedo) onRedo()
        }
      }
    },
    [onUndo, onRedo, canUndo, canRedo],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const classesPlural = unplacedCount === 1 ? 'class is' : 'classes are'
  const fullClassMessage = `${unplacedCount} full ${classesPlural} not visible`

  return (
    <Toolbar>
      {onUndo && (
        <Tooltip title="Undo">
          <span>
            <IconButton
              onClick={onUndo}
              color="primary"
              disabled={!canUndo}
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

      {onCreateCustom && (
        <Tooltip title="Create Personal Event">
          <IconButton
            onClick={onCreateCustom}
            color="primary"
          >
            <EventIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  )
}

export default TimetableControls
