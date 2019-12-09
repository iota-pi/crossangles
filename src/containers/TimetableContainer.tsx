import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState, Course, CBSEvent, Options, LinkedTimetable, CustomCourse, CourseId, Stream, Session, getAllCourses, Timetable, CourseMap, SessionFactory } from '../state';
import { notUndefined, WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableTable from '../components/Timetable';
import { arraysEqual } from '../components/Timetable/timetableUtil';


const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(4),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: CourseMap,
  chosen: Course[],
  custom: CustomCourse[],
  additional: Course[],
  events: CBSEvent[],
  options: Options,
  linkedTimetable: LinkedTimetable,
  timetableVersion: number,
  colours: Map<CourseId, string>,
  webStreams: Set<CourseId>,
}

export type Props = WithDispatch<OwnProps & StateProps>;

class TimetableContainer extends Component<Props> {
  sessionFactory: SessionFactory;

  constructor (props: Props) {
    super(props);
    this.sessionFactory = new SessionFactory(props.courses);
  }

  render () {
    const classes = this.props.classes;

    return (
      <div className={classes.spaceAbove}>
        <TimetableTable
          timetable={this.timetable}
          timetableVersion={this.props.timetableVersion}
          options={this.props.options}
          allChosenIds={new Set(this.allCourses.map(c => c.id))}
          streams={this.timetableStreams}
          colours={this.props.colours}
          webStreams={this.props.webStreams}
          sessionFactory={this.sessionFactory}
        />
      </div>
    );
  }

  shouldComponentUpdate (prevProps: Props) {
    if (this.props.courses !== prevProps.courses || this.props.chosen !== prevProps.chosen || this.props.events !== prevProps.events || this.props.options !== prevProps.options || this.props.additional !== prevProps.additional) {
      return true;
    }

    const oldSession = this.props.linkedTimetable.map(ls => Session.getId(ls));
    const newSession = prevProps.linkedTimetable.map(ls => Session.getId(ls));
    if (!arraysEqual(oldSession, newSession)) {
      return true;
    }

    return false;
  }

  componentDidUpdate () {
    this.sessionFactory.updateCourses(this.props.courses);
  }

  private get allCourses () {
    const { chosen, custom, additional } = this.props;

    return chosen.concat(custom, additional);
  }

  private get timetableStreams (): Stream[] {
    // Get all streams of chosen courses
    return ([] as Stream[]).concat(...this.allCourses.map(c => c.streams));
  }

  private get timetable (): Timetable {
    const timetable = [];
    for (const linkedSession of this.props.linkedTimetable) {
      if (this.props.courses.has(linkedSession.course)) {
        timetable.push(this.sessionFactory.create(linkedSession));
      }
    }
    return timetable;
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const courseSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);
  const customSort = (a: Course, b: Course) => +(a.name > b.name) - +(a.name < b.name);

  return {
    courses: getAllCourses(state),
    chosen: state.chosen.map(cid => notUndefined(state.courses.get(cid))).sort(courseSort),
    custom: state.custom.sort(customSort),
    additional: state.additional.map(cid => notUndefined(state.courses.get(cid))).sort(customSort),
    events: state.events,
    options: state.options,
    linkedTimetable: state.timetable,
    timetableVersion: state.timetableVersion,
    colours: state.colours,
    webStreams: state.webStreams,
  }
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
