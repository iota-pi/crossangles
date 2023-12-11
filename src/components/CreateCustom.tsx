import React, { PureComponent, ChangeEvent } from 'react';
import { modalview } from 'react-ga';

// Styles
import { Theme } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import CloseIcon from '@material-ui/icons/Close';
import TimelapseIcon from '@material-ui/icons/Timelapse';
import { CourseData, DayLetter, ClassTime, getSessions, StreamData, getDuration } from '../state';
import { CustomTimeOption, TimeOption } from './TimeOption';

const styles = (theme: Theme) => createStyles({
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
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
});

export const getBlankOption = (): CustomTimeOption => ({
  day: null,
  start: null,
  key: Math.random().toString(),
});

export interface Props extends WithStyles<typeof styles> {
  open: boolean,
  editing?: CourseData | null,
  defaultName?: string | null,
  onSave: (courseData: Omit<CourseData, 'code'>) => void,
  onClose: () => void,
  onExited?: () => void,
}

export interface State {
  placeholderName: string,
  name: string,
  duration: number,
  options: CustomTimeOption[],
}

/* eslint-disable no-multi-spaces */
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
/* eslint-enable no-multi-spaces */


class CreateCustom extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      placeholderName: '',
      name: '',
      duration: 1,
      options: [getBlankOption()],
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { defaultName, editing } = this.props;
    if (editing && editing !== prevProps.editing) {
      this.loadCourse(editing);
    }
    if (defaultName && !editing && defaultName !== prevProps.defaultName) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ name: defaultName });
    }

    if (this.props.open && !prevProps.open) {
      modalview('create-custom');
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ placeholderName: this.pickPlaceholderName() });
    }
  }

  private loadCourse = (course: CourseData) => {
    const name = course.name;
    const streams = course.streams;
    const session = getSessions(course, streams[0])[0];
    const duration = getDuration(session);
    const options: CustomTimeOption[] = streams.map(stream => {
      const { day, start } = getSessions(course, stream)[0];
      return { day, start, key: Math.random().toString() };
    });
    options.push(getBlankOption());

    this.setState({
      name,
      duration,
      options,
    });
  };

  handleClickSave = () => {
    const name = this.state.name;
    const duration = this.state.duration || 1;
    const cleanOptions = this.state.options.filter(o => o.day && o.start);
    const times = cleanOptions.map(({ day, start }): ClassTime => {
      const end = start! + duration;
      const durationString = duration !== 1 ? `-${end}` : '';
      return {
        time: `${day}${start}${durationString}`,
      };
    });
    const streams = times.map((time): StreamData => ({
      component: name,
      full: false,
      times: [time],
    }));
    const courseData: Omit<CourseData, 'code'> = { name, streams };

    this.props.onSave(courseData);
    this.handleClose();
  };

  handleClose = () => {
    this.props.onClose();
  };

  handleExited = () => {
    this.setState({
      name: '',
      duration: 1,
      options: [getBlankOption()],
    });

    if (this.props.onExited) {
      this.props.onExited();
    }
  };

  handleChangeName = (event: ChangeEvent<{ value: unknown }>) => {
    this.setState({ name: event.target.value as string });
  };

  handleChangeDuration = (event: ChangeEvent<{ value: unknown }>) => {
    this.setState({ duration: event.target.value as number });
  };

  handleChangeDay = (event: ChangeEvent<{ value: unknown }>, optionIndex: number) => {
    const options = this.state.options.slice();
    const day = event.target.value as DayLetter;
    options[optionIndex] = { ...options[optionIndex], day };
    this.updatedOptions(options, optionIndex);
  };

  handleChangeTime = (event: ChangeEvent<{ value: unknown }>, optionIndex: number) => {
    const options = this.state.options.slice();
    const start = event.target.value as number;
    options[optionIndex] = { ...options[optionIndex], start };
    this.updatedOptions(options, optionIndex);
  };

  handleClickClearDay = (optionIndex: number) => {
    const options = this.state.options.slice();
    options[optionIndex] = { ...options[optionIndex], day: null };
    this.updatedOptions(options, optionIndex);
  };

  handleClickClearTime = (optionIndex: number) => {
    const options = this.state.options.slice();
    options[optionIndex] = { ...options[optionIndex], start: null };
    this.updatedOptions(options, optionIndex);
  };

  private updatedOptions = (_options: CustomTimeOption[], lastModifiedIndex: number) => {
    const options = _options.slice();
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
  };

  private hasFullOptionLast = (options: CustomTimeOption[]) => {
    const last = options[options.length - 1];
    return last.day && last.start;
  };

  private durationError = () => {
    const latestStart = Math.max(...this.state.options.map(o => o.start || 0));
    return latestStart + this.state.duration > 24;
  };

  private startTimeError = (option: CustomTimeOption) => {
    const sameStart = this.state.options.filter(
      ({ day, start }) => start === option.start && day === option.day,
    );
    const runsTooLate = (option.start || 0) + this.state.duration > 24;
    return runsTooLate || sameStart.length > 1;
  };

  private canSubmit = (): boolean => {
    const nameError = !this.state.name;
    const durationError = this.durationError();
    const noOptionsError = this.state.options.length <= 1;

    // Don't allow an option to have a day OR a time but not both
    const emptyCellError = this.state.options.some(o => (!o.day !== !o.start));

    // Don't allow multiple options to have the same day and start time
    const startTimeError = this.state.options.some(o => this.startTimeError(o));

    return !nameError && !durationError && !emptyCellError && !noOptionsError && !startTimeError;
  };

  private pickPlaceholderName() {
    const choices = [
      'Spikeball',
      'Coffee break',
      'Watch Netflix',
      'Online lecture',
      'Sit in the Quad',
      'Assignment work',
      'Finish lab report',
      'Supervisor meeting',
      'Maintain social distance',
      // 'Line up for CSESoc BBQ',
      'Wonder where Rex Vowels is',
    ];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  render() {
    const classes = this.props.classes;

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
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6" id="custom-event-title" className={classes.flexGrow}>
            Add Personal Event
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
          <TextField
            label="Event Name"
            placeholder={this.state.placeholderName}
            value={this.state.name}
            onChange={this.handleChangeName}
            inputProps={{ maxLength: 40 }}
            helperText={`${this.state.name.length} / 40`}
            autoFocus
            className={classes.paddingBottom}
            fullWidth
          />

          <Grid container spacing={1} className={classes.paddingBottom}>
            <Grid item>
              <TimelapseIcon className={classes.marginTop} />
            </Grid>
            <Grid item className={classes.flexGrow}>
              <TextField
                label="Duration"
                select
                fullWidth
                value={this.state.duration}
                error={this.durationError()}
                onChange={this.handleChangeDuration}
                helperText={this.durationError() ? 'Events cannot be timetabled past midnight' : ''}
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
            </Grid>
          </Grid>

          <Typography paragraph>
            You may enter multiple possible times below,
            your event will be able to be scheduled in any one of them.
          </Typography>

          {this.state.options.map((option, index) => (
            <TimeOption
              option={option}
              index={index}
              hasStartTimeError={this.startTimeError(option)}
              onChangeDay={this.handleChangeDay}
              onClickClearDay={this.handleClickClearDay}
              onChangeTime={this.handleChangeTime}
              onClickClearTime={this.handleClickClearTime}
              key={`option-${option.key}`}
            />
          ))}
        </DialogContent>

        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            disabled={!this.canSubmit()}
            onClick={this.handleClickSave}
          >
            {!this.props.editing ? 'Add Event' : 'Save Event'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(CreateCustom);
