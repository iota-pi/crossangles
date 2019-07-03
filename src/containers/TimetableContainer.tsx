import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState, Course, CBSEvent, Options, Timetable, CustomCourse, CourseId, Stream, MappedSession, Session } from '../state';
import { isSet, notUndefined, WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableTable from '../components/Timetable';
import { swapStreams, bumpStream } from '../actions';


const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(2),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: Map<CourseId, Course>,
  chosen: Course[],
  custom: CustomCourse[],
  additional: Course[],
  events: CBSEvent[],
  options: Options,
  timetable: Timetable,
  colours: Map<CourseId, string>,
}

export type Props = WithDispatch<OwnProps & StateProps>;

class TimetableContainer extends Component<Props> {
  render () {
    const classes = this.props.classes;

    return (
      <div className={classes.spaceAbove}>
        <TimetableTable
          timetable={this.mappedTimetable}
          streams={this.timetableStreams}
          colours={this.props.colours}
          onSwapStreams={this.handleSwapStreams}
          onBumpStream={this.handleBumpStream}
        />
      </div>
    );
  }

  shouldComponentUpdate (prevProps: Props) {
    if (this.props.courses !== prevProps.courses || this.props.chosen !== prevProps.chosen || this.props.events !== prevProps.events || this.props.options !== prevProps.options || this.props.additional !== prevProps.additional) {
      return true;
    }

    if (this.props.timetable !== prevProps.timetable) {
      return true;
    }

    return false;
  }

  private handleSwapStreams = (oldStream: Stream, newStream: Stream, topSession: Session) => {
    this.props.dispatch(swapStreams(this.props.timetable, oldStream, newStream, topSession));
  }

  private handleBumpStream = (stream: Stream, session: Session) => {
    this.props.dispatch(bumpStream(this.props.timetable, stream, session));
  }

  private get allCourses () {
    return this.props.chosen.concat(this.props.custom, this.props.additional)
  }

  private get timetableStreams (): Stream[] {
    // Get all streams of chosen courses
    return ([] as Stream[]).concat(...this.allCourses.map(c => c.streams));
  }

  private get mappedTimetable (): MappedSession[] {
    return this.props.timetable.map((s, i) => {
      const course = notUndefined(this.props.courses.get(s.course));
      const stream = course.streams.filter(stream => stream.id === s.stream)[0];
      return {
        ...s,
        course,
        stream,
      };
    });
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const chosenSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);

  return {
    courses: state.courses,
    chosen: state.chosen.map(cid => isSet(state.courses.get(cid))).sort(chosenSort),
    custom: state.custom,
    additional: state.additional.map(cid => isSet(state.courses.get(cid))),
    events: state.events,
    options: state.options,
    timetable: state.timetable,
    colours: state.colours,
  }
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
