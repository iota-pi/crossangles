import { PureComponent, ChangeEvent } from 'react'

// Styles
import { Theme } from '@mui/material/styles'
import { withStyles } from 'tss-react/mui'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CloseIcon from '@mui/icons-material/Close'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import { CourseData, DayLetter, ClassTime, getSessions, getDuration, LinkedSession } from '../state'
import { CustomTimeOption } from './TimeOption'
import { InputAdornment, Stack } from '@mui/material'

const styles = (theme: Theme) => ({
  dialog: {},
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  flexGrow: {
    flexGrow: 1,
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  marginTop: {
    marginTop: theme.spacing(2.5),
  },
  paddedField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
})

export const getBlankOption = (): CustomTimeOption => ({
  day: null,
  start: null,
  key: Math.random().toString(),
})

export interface Props {
  // editing?: CourseData | null,
  // defaultName?: string | null,
  // onSave: (courseData: Omit<CourseData, 'code'>) => void,
  // onExited?: () => void,
  open: boolean,
  session: LinkedSession,
  onClose: () => void,
}

interface InternalProps extends Props {
  classes: Record<keyof ReturnType<typeof styles>, string>
}

export interface State {
  placeholderName: string,
  name: string,
  duration: number,
  options: CustomTimeOption[],
}


// ... (omitting middle section for brevity, will targeted replace around imports and export)
// Actually I need to split this because file is large.

// I will do multi_replace.


const durationOptions = [
  // needs to be a function that finds concurrent classes of indentical event
  { text: '½ an hour', duration: 0.5 },
  { text: '1 hour', duration: 1 },
  { text: '1½ hours', duration: 1.5 },
  { text: '2 hours', duration: 2 },
  { text: '2½ hours', duration: 2.5 },
  { text: '3 hours', duration: 3 },
  { text: '3½ hours', duration: 3.5 },
  { text: '4 hours', duration: 4 },
  { text: '4½ hours', duration: 4.5 },
  { text: '5 hours', duration: 5 },
  { text: '5½ hours', duration: 5.5 },
  { text: '6 hours', duration: 6 },
  { text: '6½ hours', duration: 6.5 },
  { text: '7 hours', duration: 7 },
  { text: '7½ hours', duration: 7.5 },
  { text: '8 hours', duration: 8 },
  { text: '8½ hours', duration: 8.5 },
  { text: '9 hours', duration: 9 },
  { text: '9½ hours', duration: 9.5 },
  { text: '10 hours', duration: 10 },
]


class ViewEvent extends PureComponent<InternalProps, State> {
  constructor(props: InternalProps) {
    super(props)
    this.state = {
      placeholderName: '',
      name: '',
      duration: 1,
      options: [getBlankOption()],
    }
  }

  private loadCourse = (course: CourseData) => {
    const name = course.name
    const streams = course.streams
    const session = getSessions(course, streams[0])[0]
    const duration = getDuration(session)
    const options: CustomTimeOption[] = streams.map(stream => {
      const { day, start } = getSessions(course, stream)[0]
      return { day, start, key: Math.random().toString() }
    })
    options.push(getBlankOption())

    this.setState({
      name,
      duration,
      options,
    })
  }

  handleClickSave = () => {
    const name = this.state.name
    const duration = this.state.duration || 1
    const cleanOptions = this.state.options.filter(o => o.day && o.start)
    const times = cleanOptions.map(({ day, start }): ClassTime => {
      const end = start! + duration
      const durationString = duration !== 1 ? `-${end}` : ''
      return {
        time: `${day}${start}${durationString}`,
      }
    })
    this.handleClose()
  }

  handleClose = () => {
    this.props.onClose()
  }

  handleExited = () => {
    this.setState({
      name: '',
      duration: 1,
      options: [getBlankOption()],
    })

  }

  handleChangeName = (event: ChangeEvent<{ value: unknown }>) => {
    this.setState({ name: event.target.value as string })
  }

  handleChangeDuration = (event: ChangeEvent<{ value: unknown }>) => {
    this.setState({ duration: event.target.value as number })
  }

  handleChangeDay = (event: ChangeEvent<{ value: unknown }>, optionIndex: number) => {
    const options = this.state.options.slice()
    const day = event.target.value as DayLetter
    options[optionIndex] = { ...options[optionIndex], day }
    this.updatedOptions(options, optionIndex)
  }

  handleChangeTime = (event: ChangeEvent<{ value: unknown }>, optionIndex: number) => {
    const options = this.state.options.slice()
    const start = event.target.value as number
    options[optionIndex] = { ...options[optionIndex], start }
    this.updatedOptions(options, optionIndex)
  }

  handleClickClearDay = (optionIndex: number) => {
    const options = this.state.options.slice()
    options[optionIndex] = { ...options[optionIndex], day: null }
    this.updatedOptions(options, optionIndex)
  }

  handleClickClearTime = (optionIndex: number) => {
    const options = this.state.options.slice()
    options[optionIndex] = { ...options[optionIndex], start: null }
    this.updatedOptions(options, optionIndex)
  }

  private updatedOptions = (_options: CustomTimeOption[], lastModifiedIndex: number) => {
    const options = _options.slice()
    const option = options[lastModifiedIndex]
    if (option.day || option.start) {
      if (this.hasFullOptionLast(options)) {
        options.push(getBlankOption())
      }
    } else if (options.length > 1) {
      options.splice(lastModifiedIndex, 1)
      if (this.hasFullOptionLast(options)) {
        options.push(getBlankOption())
      }
    }

    this.setState({ options })
  }

  private hasFullOptionLast = (options: CustomTimeOption[]) => {
    const last = options[options.length - 1]
    return last.day && last.start
  }

  private canSubmit = (): boolean => {
    // does event exist error ?? 
    return true
  }

  private pickPlaceholderName() {
    const choices = [
      'Bible',
    ]
    return choices[Math.floor(Math.random() * choices.length)]
  }

  render() {
    const classes = this.props.classes
    const session = this.props.session
    return (
      <Dialog
        open={this.props.open}
        onClose={this.handleClose}
        TransitionProps={{
          onExited: this.handleExited,
        }}
        aria-labelledby="custom-event-title"
        className={classes.dialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6" component="div" id="custom-event-title" className={classes.flexGrow}>
            {session.course.code + ': ' + session.course.name} {/* class code + event type  */}
          </Typography>

          <IconButton
            aria-label="close"
            onClick={this.handleClose}
            className={classes.moveRight}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* info: 
            class full name 
            class location 
            active weeks 
            class time 
            class capacity 
          */}
          <Stack spacing={2} mt={1}>
            <TextField
              label="Event a"
              placeholder={this.state.placeholderName}
              value={this.state.name}
              onChange={this.handleChangeName}
              inputProps={{ maxLength: 40 }}
              helperText={`${this.state.name.length} / 40`}
              autoFocus
              fullWidth
            />

            <TextField
              label="Duration"
              select
              fullWidth
              value={this.state.duration}
              // error={this.durationError()}
              onChange={this.handleChangeDuration}
              // helperText={this.durationError() ? 'Events cannot be timetabled past midnight' : ''}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimelapseIcon />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {durationOptions.map(item => (
                <MenuItem
                  value={item.duration}
                  key={item.text}
                >
                  {item.text}
                </MenuItem>
              ))}
            </TextField>

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            disabled={!this.canSubmit()}
            onClick={this.handleClickSave}
          >
            {'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(ViewEvent, styles) as unknown as React.ComponentType<Props>
