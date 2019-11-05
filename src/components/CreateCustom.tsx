import React, { PureComponent, ChangeEvent } from 'react';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Dialog, DialogTitle, Typography, IconButton, DialogContent, Button, DialogActions, TextField, MenuItem, Grid, InputAdornment } from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import CloseIcon from '@material-ui/icons/Close';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import { DayLetter } from '../state';
import { ClassTime } from '../state/times';

const styles = (theme: Theme) => createStyles({
  dialog: {
  },
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
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  clearButton: {
    marginRight: theme.spacing(3),
    cursor: 'pointer',
  },
});

export interface CustomTimeOption {
  day: DayLetter | null,
  start: number | null,
}

export const getBlankOption = (): CustomTimeOption => {
  return { day: null, start: null };
};

export interface Props extends WithStyles<typeof styles> {
  onSave: (name: string, times: ClassTime[]) => void,
}

export interface State {
  open: boolean,
  placeholderName: string,
  name: string,
  duration: number,
  options: CustomTimeOption[],
}

const durationOptions = [
  { text: '½ an hour', duration: 0.5 },
  { text: '1 hour',    duration: 1 },
  { text: '1½ hours',  duration: 1.5 },
  { text: '2 hours',   duration: 2 },
  { text: '2½ hours',  duration: 2.5 },
  { text: '3 hours',   duration: 3 },
  { text: '3½ hours',  duration: 3.5 },
  { text: '4 hours',   duration: 4 },
  { text: '4½ hours',  duration: 4.5 },
  { text: '5 hours',   duration: 5 },
  { text: '5½ hours',  duration: 5.5 },
  { text: '6 hours',   duration: 6 },
  { text: '6½ hours',  duration: 6.5 },
  { text: '7 hours',   duration: 7 },
  { text: '7½ hours',  duration: 7.5 },
  { text: '8 hours',   duration: 8 },
  { text: '8½ hours',  duration: 8.5 },
  { text: '9 hours',   duration: 9 },
  { text: '9½ hours',  duration: 9.5 },
  { text: '10 hours',  duration: 10 },
];

const dayOptions = [
  { text: 'Monday',    letter: 'M' },
  { text: 'Tuesday',   letter: 'T' },
  { text: 'Wednesday', letter: 'W' },
  { text: 'Thursday',  letter: 'H' },
  { text: 'Friday',    letter: 'F' },
];

const timeOptions = [
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
  { text: '08:00 PM', time: 20 }
];

class CreateCustom extends PureComponent<Props, State> {
  state: State = {
    open: false,
    placeholderName: '',
    name: '',
    duration: 1,
    options: [getBlankOption()],
  }

  render() {
    const classes = this.props.classes;

    return (
      <div>
        <IconButton color="primary" onClick={this.handleClickOpen}>
          <EventIcon/>
        </IconButton>

        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="custom-event-dialog-title"
          className={classes.dialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle disableTypography className={classes.dialogTitle}>
            <Typography variant="h6" id="custom-event-dialog-title" className={classes.flexGrow}>
              Add Personal Event
            </Typography>

            <IconButton aria-label="close" onClick={this.handleClose} className={classes.moveRight}>
              <CloseIcon></CloseIcon>
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <TextField
              label="Event Name"
              className={classes.paddingBottom}
              placeholder={this.state.placeholderName}
              value={this.state.name}
              fullWidth
              onChange={this.handleChangeName}
            />

            <Grid container spacing={1} alignItems="flex-end" className={classes.paddingBottom}>
              <Grid item>
                <TimelapseIcon />
              </Grid>
              <Grid item className={classes.flexGrow}>
                <TextField
                  label="Duration"
                  select
                  fullWidth
                  value={this.state.duration}
                  onChange={this.handleChangeDuration}
                >
                  {durationOptions.map(item => (
                    <MenuItem value={item.duration} key={item.text}>
                      {item.text}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Typography paragraph>
              You may enter multiple possible times below, your event will be able to be scheduled in any one of them.
            </Typography>

            {this.state.options.map((option, i) => (
              <Grid
                container
                spacing={1}
                alignItems="flex-end"
                key={`option-${i}`}
                className={classes.paddingBottom}
              >
                <Grid item xs={12} sm={2}>
                  <Typography>Option {i + 1}</Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Day"
                    select
                    fullWidth
                    value={option.day || ''}
                    onChange={event => this.handleChangeDay(event, i)}
                    InputProps={{
                      endAdornment: option.day && (
                        <InputAdornment position="end" className={classes.clearButton}>
                          <IconButton
                            aria-label="clear"
                            disableRipple
                            disableFocusRipple
                            size="small"
                            onClick={() => this.handleClickClearDay(i)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  >
                    {dayOptions.map(item => (
                      <MenuItem value={item.letter} key={item.text}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Start time"
                    select
                    fullWidth
                    value={option.start || ''}
                    onChange={event => this.handleChangeTime(event, i)}
                    InputProps={{
                      endAdornment: option.start && (
                        <InputAdornment position="end" className={classes.clearButton}>
                          <IconButton
                            aria-label="clear"
                            disableRipple
                            disableFocusRipple
                            size="small"
                            onClick={() => this.handleClickClearTime(i)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  >
                    {timeOptions.map(item => (
                      <MenuItem value={item.time} key={item.text}>
                        {item.text}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            ))}
          </DialogContent>

          <DialogActions>
            <Button color="primary" variant="contained" fullWidth onClick={this.handleClickSave}>
              Add Event
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  handleClickOpen = () => {
    this.setState({
      open: true,
      placeholderName: this.pickPlaceholderName(),
    });
  }

  handleClickSave = () => {
    const cleanOptions = this.state.options.filter(o => o.day && o.start);
    const duration = this.state.duration || 1;

    this.props.onSave(
      this.state.name,
      cleanOptions.map(option => ({
        time: `${option.day}${option.start}` + (duration !== 1) ? `${option.start! + duration}` : '',
      })),
    );
    this.handleClose();
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleChangeName = (event: ChangeEvent<{value: unknown}>) => {
    this.setState({ name: event.target.value as string });
  }

  handleChangeDuration = (event: ChangeEvent<{ value: unknown }>) => {
    this.setState({ duration: event.target.value as number });
  }

  handleChangeDay = (event: ChangeEvent<{value: unknown}>, optionIndex: number) => {
    let options = this.state.options.slice();
    const day = event.target.value as DayLetter;
    options[optionIndex] = Object.assign({}, options[optionIndex], { day });
    this.updatedOptions(options, optionIndex);
  }

  handleChangeTime = (event: ChangeEvent<{value: unknown}>, optionIndex: number) => {
    let options = this.state.options.slice();
    const start = event.target.value as number;
    options[optionIndex] = Object.assign({}, options[optionIndex], { start });
    this.updatedOptions(options, optionIndex);
  }

  handleClickClearDay = (optionIndex: number) => {
    let options = this.state.options.slice();
    options[optionIndex] = Object.assign({}, options[optionIndex], { day: null });
    this.updatedOptions(options, optionIndex);
  }

  handleClickClearTime = (optionIndex: number) => {
    let options = this.state.options.slice();
    options[optionIndex] = Object.assign({}, options[optionIndex], { start: null });
    this.updatedOptions(options, optionIndex);
  }

  private updatedOptions = (options: CustomTimeOption[], lastModifiedIndex: number) => {
    options = options.slice();
    const option = options[lastModifiedIndex];
    if (option.day || option.start) {
      if (this.hasFullOptionLast(options)) {
        options.push(getBlankOption());
      }
    } else if (options.length > 1) {
      options.splice(lastModifiedIndex, 1);
      if (this.hasFullOptionLast(options)) {
        options.push(getBlankOption());
      }
    }

    this.setState({ options });
  }

  private hasFullOptionLast = (options: CustomTimeOption[]) => {
    const last = options[options.length - 1];
    return last.day && last.start;
  }

  private pickPlaceholderName () {
    const choices = [
      'Catching the bus',
      'Tutoring COMP1511',
      'Skipping a lecture',
      'Sitting in the Quad',
      'Planning my holidays',
      'Watching some Netflix',
      'Playing some spikeball',
      'Sleeping in the library',
      'Chasing Richard Buckland',
      'Watching a lecture online',
      'Doing my tutorial homework',
      'Applying for a grad program',
      'Lining up for the CSESoc BBQ',
      'Wondering where Rex Vowels is',
      'Complaining about my lecturers',
      'Pretending to study for an exam',
      'Boasting about skipping lectures',
      'Meeting with my thesis supervisor',
      'Drinking the best coffee on campus',
      "Joining societies I'll never attend",
      'Being noisy outside lecture theatres',
    ]
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

export default withStyles(styles)(CreateCustom);
