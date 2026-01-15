import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import InvertColors from '@mui/icons-material/InvertColors'
import InvertColorsOff from '@mui/icons-material/InvertColorsOff'
import AppOptions from './AppOptions'
import AboutCrossAngles from './AboutCrossAngles'
import { RootState } from '../state'
import { getOptions } from '../state/selectors'
import { toggleOption } from '../actions'
import { useMediaQuery, useTheme } from '@mui/material'
import { useCallback } from 'react'

const useStyles = makeStyles()(theme => ({
  grow: {
    flexGrow: 1,
  },
  term: {
    marginRight: theme.spacing(1),
    fontWeight: 300,
    fontSize: '1.1rem',
  },
  termNumber: {
    fontWeight: 500,
  },
}))

export interface Props {
  onShowContact: () => void,
  onViewChangelog: () => void,
}


export function CrossAnglesAppBar({
  onShowContact,
  onViewChangelog,
}: Props) {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { darkMode } = useSelector(getOptions)
  const { term, year } = useSelector((state: RootState) => state.meta)
  const handleClickDarkMode = useCallback(
    () => dispatch(toggleOption('darkMode')),
    [dispatch],
  )

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  return (
    <AppBar
      position="fixed"
      color={darkMode ? 'secondary' : 'primary'}
      enableColorOnDark
    >
      <Toolbar>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          CrossAngles
        </Typography>

        <Tooltip
          title={
            `Course data is for Term ${term}, ${year}. `
            + 'CrossAngles will automatically update when the data for the next term becomes available.'
          }
        >
          <Typography color="inherit" className={classes.term}>
            {!xs && 'Term '}
            <span className={classes.termNumber}>
              {xs && 'T'}
              {term}
            </span>
            {!xs && ` ${year}`}
          </Typography>
        </Tooltip>

        <IconButton onClick={handleClickDarkMode} color="inherit">
          {darkMode ? (
            <InvertColorsOff />
          ) : (
            <InvertColors />
          )}
        </IconButton>

        <AboutCrossAngles onShowContact={onShowContact} />
        <AppOptions onViewChangelog={onViewChangelog} />
      </Toolbar>
    </AppBar>
  )
}

export default CrossAnglesAppBar
