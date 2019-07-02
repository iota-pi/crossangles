import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState, Course, CBSEvent, Options, Timetable, CustomCourse, CourseId, Stream, MappedSession } from '../state';
import { updateTimetable, UpdateTimetableConfig } from '../actions';
import { isSet, notUndefined } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { Button } from '@material-ui/core';

// Components
import TimetableTable from '../components/Timetable';


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

export interface DispatchProps {
  updateTimetable: (config: UpdateTimetableConfig) => void;
}

export type Props = OwnProps & StateProps & DispatchProps;

class TimetableContainer extends Component<Props> {
  render () {
    // const classes = this.props.classes;

    return (
      <React.Fragment>
        <Button variant="outlined" color="primary" onClick={this.handleTimetableUpdate}>
          Click
        </Button>

        <TimetableTable
          timetable={this.mappedTimetable}
          streams={this.timetableStreams}
          colours={this.props.colours}
        />
      </React.Fragment>
    );
  }

  shouldComponentUpdate (prevProps: Props) {
    if (this.props.courses !== prevProps.courses || this.props.chosen !== prevProps.chosen || this.props.events !== prevProps.events || this.props.options !== prevProps.options || this.props.additional !== prevProps.additional) {

      return true;
    }

    return false;
  }

  handleTimetableUpdate = () => {
    this.props.updateTimetable({
      courses: this.allCourses,
      events: this.props.events,
      previousTimetable: this.props.timetable,
      options: this.props.options,
    })
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
        id: `${stream.id}-${i}`,
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

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    updateTimetable: async (config: UpdateTimetableConfig) => await dispatch(updateTimetable(config)),
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(TimetableContainer));
