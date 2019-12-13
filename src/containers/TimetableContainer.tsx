import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState, Course, CBSEvent, Options, CustomCourse, CourseId, Stream, getAllCourses, CourseMap, SessionFactory } from '../state';
import { notUndefined, WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableTable from '../components/Timetable';
import { arraysEqual } from '../components/Timetable/timetableUtil';
import { SessionManager, hydrateLinkedSessionManager } from '../components/Timetable/SessionManager';


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
  sessionManager: SessionManager,
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
          sessionManager={this.props.sessionManager}
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

    // TODO is this necessary? should they be sorted first?
    const oldSessions = this.props.sessionManager.order;
    const newSessions = prevProps.sessionManager.order;
    if (!arraysEqual(oldSessions, newSessions)) {
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
}

const mapStateToProps = (state: RootState): StateProps => {
  const courseSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);
  const customSort = (a: Course, b: Course) => +(a.name > b.name) - +(a.name < b.name);
  const sessionFactory = new SessionFactory(state.courses);

  return {
    courses: getAllCourses(state),
    chosen: state.chosen.map(cid => notUndefined(state.courses.get(cid))).sort(courseSort),
    custom: state.custom.sort(customSort),
    additional: state.additional.map(cid => notUndefined(state.courses.get(cid))).sort(customSort),
    events: state.events,
    options: state.options,
    sessionManager: hydrateLinkedSessionManager(state.sessionManager, sessionFactory),
    colours: state.colours,
    webStreams: state.webStreams,
  };
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
