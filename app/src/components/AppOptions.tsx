import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Settings from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'
import { modalview } from 'react-ga'
import { generalOptionList, OptionName } from '../state'
import { getOptions } from '../state/selectors'
import { toggleOption } from '../actions'
import ScoringConfig from './ScoringConfig'
import { useCallback, useState } from 'react'


const useStyles = makeStyles()(theme => ({
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  dialogActions: {
    flexDirection: 'column',
    padding: theme.spacing(1, 3, 2),
  },
  flexGrow: {
    flexGrow: 1,
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  marginBottom: {
    marginBottom: theme.spacing(1),
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  selectTrack: {
    opacity: 0.6 * 0.38,
  },
  optionLabel: {
    cursor: 'pointer',
  },
}))


export interface Props {
  onViewChangelog: () => void,
}


const AppOptions = ({ onViewChangelog }: Props) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const options = useSelector(getOptions)
  const { darkMode } = options
  const [showDialog, setShowDialog] = useState(false)
  const [showScoreConfig, setShowScoreConfig] = useState(false)

  const handleOpen = useCallback(
    () => {
      setShowDialog(true)
      modalview('about-crossangles')
    },
    [],
  )
  const handleClose = useCallback(() => setShowDialog(false), [])
  const handleChange = useCallback(
    (option: OptionName) => dispatch(toggleOption(option)),
    [dispatch],
  )
  const handleViewChangelog = useCallback(
    () => {
      handleClose()
      onViewChangelog()
      modalview('changelog')
    },
    [handleClose, onViewChangelog],
  )
  const handleClickScoreConfig = useCallback(
    () => {
      handleClose()
      setShowScoreConfig(true)
      modalview('score-config')
    },
    [handleClose],
  )
  const handleCloseScoreConfig = useCallback(
    () => {
      setShowDialog(true)
      setShowScoreConfig(false)
    },
    [],
  )

  return (
    <div>
      <IconButton
        color="inherit"
        onClick={handleOpen}
      >
        <Settings />
      </IconButton>

      <Dialog
        open={showDialog}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6" className={classes.flexGrow}>
            Settings
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
          {generalOptionList.map(([name, label]) => (
            <div className={classes.optionContainer} key={name}>
              <Typography
                className={classes.optionLabel}
                onClick={() => handleChange(name)}
              >
                {label}
              </Typography>

              <Switch
                checked={options[name] || false}
                onChange={() => handleChange(name)}
                color={darkMode ? 'primary' : 'secondary'}
                classes={{ track: classes.selectTrack }}
              />
            </div>
          ))}

          <div className={classes.optionContainer}>
            <Typography className={classes.optionLabel}>
              Customise auto-timetabling
            </Typography>

            <IconButton
              aria-label="customise"
              onClick={handleClickScoreConfig}
            >
              <Settings />
            </IconButton>
          </div>
        </DialogContent>

        <DialogActions className={classes.dialogActions} disableSpacing>
          <Button
            onClick={handleViewChangelog}
            className={classes.marginBottom}
            fullWidth
            variant="outlined"
          >
            View Changelog
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

      <ScoringConfig
        open={showScoreConfig}
        onClose={handleCloseScoreConfig}
      />
    </div>
  )
}
export default AppOptions
