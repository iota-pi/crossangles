import { ChangeEvent } from 'react'

// Styles
import { Theme } from '@mui/material/styles'
import { makeStyles } from 'tss-react/mui'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import CloseIcon from '@mui/icons-material/Close'
import CalendarToday from '@mui/icons-material/CalendarToday'
import AccessTime from '@mui/icons-material/AccessTime'
import { DayLetter } from '../state'

const useStyles = makeStyles()((theme: Theme) => ({
  flexGrow: {
    flexGrow: 1,
  },
  marginTop: {
    marginTop: theme.spacing(2.5),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  clearButton: {
    marginRight: theme.spacing(3),
    cursor: 'pointer',
  },
}))


const dayOptions = [
  { text: 'Monday', letter: 'M' },
  { text: 'Tuesday', letter: 'T' },
  { text: 'Wednesday', letter: 'W' },
  { text: 'Thursday', letter: 'H' },
  { text: 'Friday', letter: 'F' },
  { text: 'Saturday', letter: 'S' },
  { text: 'Sunday', letter: 's' },
]

const timeOptions = [
  { text: '06:00 AM', time: 6 },
  { text: '06:30 AM', time: 6.5 },
  { text: '07:00 AM', time: 7 },
  { text: '07:30 AM', time: 7.5 },
  { text: '08:00 AM', time: 8 },
  { text: '08:30 AM', time: 8.5 },
  { text: '09:00 AM', time: 9 },
  { text: '09:30 AM', time: 9.5 },
  { text: '10:00 AM', time: 10 },
  { text: '10:30 AM', time: 10.5 },
  { text: '11:00 AM', time: 11 },
  { text: '11:30 AM', time: 11.5 },
  { text: '12:00 PM', time: 12 },
  { text: '12:30 PM', time: 12.5 },
  { text: '01:00 PM', time: 13 },
  { text: '01:30 PM', time: 13.5 },
  { text: '02:00 PM', time: 14 },
  { text: '02:30 PM', time: 14.5 },
  { text: '03:00 PM', time: 15 },
  { text: '03:30 PM', time: 15.5 },
  { text: '04:00 PM', time: 16 },
  { text: '04:30 PM', time: 16.5 },
  { text: '05:00 PM', time: 17 },
  { text: '05:30 PM', time: 17.5 },
  { text: '06:00 PM', time: 18 },
  { text: '06:30 PM', time: 18.5 },
  { text: '07:00 PM', time: 19 },
  { text: '07:30 PM', time: 19.5 },
  { text: '08:00 PM', time: 20 },
]


export interface CustomTimeOption {
  day: DayLetter | null,
  start: number | null,
  key: string,
}

export interface TimeOptionProps {
  option: CustomTimeOption,
  index: number,
  hasStartTimeError: boolean,
  onChangeDay: (event: ChangeEvent<{ value: unknown }>, optionIndex: number) => void,
  onClickClearDay: (optionIndex: number) => void,
  onChangeTime: (event: ChangeEvent<{ value: unknown }>, optionIndex: number) => void,
  onClickClearTime: (optionIndex: number) => void,
}

export const TimeOption = ({
  option,
  index,
  hasStartTimeError,
  onChangeDay,
  onClickClearDay,
  onChangeTime,
  onClickClearTime,
}: TimeOptionProps) => {
  const { classes } = useStyles()

  return (
    <Grid
      container
      spacing={1}
      alignItems="flex-end"
      className={classes.paddingBottom}
    >
      <Grid size={{ xs: 12, sm: 2 }}>
        <Typography>
          Option {index + 1}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 5 }}>
        <Grid container spacing={1}>
          <Grid>
            <CalendarToday className={classes.marginTop} />
          </Grid>
          <Grid className={classes.flexGrow}>
            <TextField
              label="Day"
              select
              fullWidth
              value={option.day || ''}
              onChange={event => onChangeDay(event, index)}
              InputProps={{
                endAdornment: option.day && (
                  <InputAdornment position="end" className={classes.clearButton}>
                    <IconButton
                      aria-label="clear"
                      disableRipple
                      disableFocusRipple
                      size="small"
                      onClick={() => onClickClearDay(index)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            >
              {dayOptions.map(item => (
                <MenuItem
                  value={item.letter}
                  key={item.text}
                >
                  {item.text}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, sm: 5 }}>
        <Grid container spacing={1}>
          <Grid>
            <AccessTime className={classes.marginTop} />
          </Grid>
          <Grid className={classes.flexGrow}>
            <TextField
              label="Start time"
              select
              fullWidth
              value={option.start || ''}
              onChange={event => onChangeTime(event, index)}
              error={hasStartTimeError}
              InputProps={{
                endAdornment: option.start && (
                  <InputAdornment position="end" className={classes.clearButton}>
                    <IconButton
                      aria-label="clear"
                      disableRipple
                      disableFocusRipple
                      size="small"
                      onClick={() => onClickClearTime(index)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            >
              {timeOptions.map(item => (
                <MenuItem
                  value={item.time}
                  key={item.text}
                >
                  {item.text}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
export default TimeOption
