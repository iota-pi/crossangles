import { ChangeEvent, Fragment, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import makeStyles from '@material-ui/core/styles/makeStyles'

import CloseIcon from '@material-ui/icons/Close'
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  IconButton,
  Slider,
  Typography,
} from '@material-ui/core'
import { setScoreConfig } from '../actions'
import { RootState } from '../state'
import { defaultScoreConfig, TimetableScoreConfig } from '../timetable/scoreTimetable'


const useStyles = makeStyles(theme => ({
  root: {
    marginTop: '15vh',
    marginBottom: '15vh',
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  dialogActions: {
    padding: theme.spacing(1, 3, 2),
  },
  flexGrow: {
    flexGrow: 1,
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  timeline: {
    padding: 0,
  },
  timelineDate: {
    maxWidth: 135,
  },
  detailList: {
    position: 'relative',
    marginLeft: theme.spacing(2),

    '&>div::before': {
      content: '"–"',
      position: 'absolute',
      left: -theme.spacing(1.5),
    },
  },
}))


export interface Props {
  onClose: () => void,
  open: boolean,
}

const customWeightLabels: [keyof TimetableScoreConfig, string][] = [
  ['clash', 'Avoid class clashes'],
  ['freeDays', 'Minimise days at uni'],
  ['dayLength', 'Prefer shorter days'],
  ['times', 'Avoid early and late classes'],
]

const MIN_WEIGHT = 0.1
const MAX_WEIGHT = 2


const ScoringConfig = ({ onClose, open }: Props) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const initialConfig = useSelector((state: RootState) => state.scoreConfig)
  const [config, setConfig] = useState(initialConfig)
  const onChange = useCallback(
    (changedKey: keyof TimetableScoreConfig) => (
      (event: ChangeEvent<any>, _value: number | number[]) => {
        const value = _value as number
        const change = value - config[changedKey]
        const configEntries = Object.entries(config).filter(([key, _]) => key !== changedKey)
        configEntries.sort(([, a], [, b]) => (change < 0 ? b - a : a - b))
        let remainingChange = -change
        for (let i = 0; i < configEntries.length; ++i) {
          const remainingEntries = configEntries.length - i
          const thisChange = remainingChange / remainingEntries
          const tentativeValue = configEntries[i][1] + thisChange
          const boundedValue = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, tentativeValue))
          const actualChange = boundedValue - configEntries[i][1]
          remainingChange -= actualChange
          configEntries[i][1] = boundedValue
        }

        const newConfig = { ...Object.fromEntries(configEntries), [changedKey]: value }
        setConfig(newConfig as typeof config)
      }
    ),
    [config],
  )
  const handleClose = useCallback(
    () => {
      dispatch(setScoreConfig(config))
      onClose()
    },
    [config, dispatch, onClose],
  )
  const handleReset = useCallback(
    () => {
      setConfig(defaultScoreConfig)
    },
    [],
  )

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={classes.root}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6" className={classes.flexGrow}>
          Customise Auto-Timetabling
        </Typography>

        <IconButton
          aria-label="close"
          onClick={handleClose}
          className={classes.moveRight}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {customWeightLabels.map(([key, label]) => (
          <Fragment key={key}>
            <Typography gutterBottom>
              {label}
            </Typography>

            <Slider
              value={Math.round(config[key] * 100) / 100}
              min={MIN_WEIGHT}
              step={0.01}
              max={MAX_WEIGHT}
              onChange={onChange(key)}
            />
          </Fragment>
        ))}
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleReset}
          fullWidth
          variant="outlined"
        >
          Reset
        </Button>

        <Button
          onClick={handleClose}
          fullWidth
          variant="outlined"
          color="primary"
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScoringConfig
