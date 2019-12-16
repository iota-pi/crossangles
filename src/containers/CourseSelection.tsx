import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  RootState,
  Course,
  CBSEvent,
  Options,
  OptionName,
  CourseId,
  CustomCourse,
  CourseData,
  SessionFactory,
} from '../state';
import {
  addCourse,
  removeCourse,
  toggleWebStream,
  toggleEvent,
  toggleOption,
  doTimetableSearch,
  setNotice,
  bumpTimetableVersion,
  addCustom,
  removeCustom,
  updateCustom,
} from '../actions';
import { updateSessionManager } from '../actions';
import { isSet, WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import Autocomplete from '../components/Autocomplete';
import CourseDisplay from '../components/CourseDisplay';
import GeneralOptions from '../components/GeneralOptions';
import { setColour } from '../actions';
import CreateCustom from '../components/CreateCustom';
import { ClassTime } from '../state/times';
import { SessionManager, hydrateLinkedSessionManager } from '../components/Timetable/SessionManager';
import CourseManager from '../state/CourseManager';

const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(2),
  },
  flex: {
    display: 'flex',
  },
  flexGrow: {
    flexGrow: 1,
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: CourseManager,
  sessionFactory: SessionFactory,
  courseList: Course[],
  chosen: Course[],
  events: CBSEvent[],
  options: Options,
  sessionManager: SessionManager,
  colours: Map<CourseId, string>,
  webStreams: Set<CourseId>,
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  editingCourse: CustomCourse | null,
}

class CourseSelection extends Component<Props, State> {
  state: State = {
    editingCourse: null,
  }

  render () {
    const classes = this.props.classes;

    return (
      <React.Fragment>
        <div className={classes.flex}>
          <div className={classes.flexGrow}>
            <Autocomplete
              courses={this.props.courseList}
              chosen={this.props.chosen}
              additional={this.props.courses.additional}
              chooseCourse={this.chooseCourse}
              maxItems={20}
            />
          </div>

          <CreateCustom
            editing={this.state.editingCourse}
            onClearEditing={this.handleClearEditing}
            onSave={this.addCustom}
          />
        </div>

        <div className={classes.spaceAbove}>
          <CourseDisplay
            chosen={this.props.chosen}
            custom={this.props.courses.custom}
            additional={this.props.courses.additional}
            events={this.props.events}
            colours={this.props.colours}
            webStreams={this.props.webStreams}
            onEditCustomCourse={this.editCustomCourse}
            onRemoveCourse={this.removeCourse}
            onToggleEvent={this.toggleEvent}
            onToggleWeb={this.toggleWebStream}
            onColourChange={this.changeColour}
          />
        </div>

        <div className={classes.spaceAbove}>
          <GeneralOptions
            options={this.props.options}
            onToggleOption={this.toggleOption}
          />
        </div>
      </React.Fragment>
    );
  }

  private get allCourses () {
    return this.props.chosen.concat(this.props.courses.custom, this.props.courses.additional);
  }

  private chooseCourse = async (course: Course) => {
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable();
  }

  private addCustom = async (name: string, times: ClassTime[]) => {
    let course: CustomCourse;
    const updatedValues: Omit<CourseData, 'code'> = {
      name,
      streams: times.map(time => ({
        component: name,
        enrols: [0, 0],
        full: false,
        times: [time],
      })),
    }

    if (this.state.editingCourse) {
      course = new CustomCourse({
        ...this.state.editingCourse.data,
        ...updatedValues,
      });
      await this.props.dispatch(updateCustom(
        this.state.editingCourse,
        updatedValues,
      ));
    } else {
      course = new CustomCourse({
        code: 'custom_' + Math.random(),
        isCustom: true,
        ...updatedValues,
      });
      await this.props.dispatch(addCustom(course));
      await this.props.dispatch(setColour(course.id));
    }

    await this.updateTimetable();
    this.setState({ editingCourse: null }); // TODO replace with after close in CreateCustom
  }

  private removeCourse = async (course: Course | CustomCourse) => {
    if (course.isCustom) {
      await this.props.dispatch(removeCustom(course));
    } else {
      await this.props.dispatch(removeCourse(course));
    }
    await this.updateTimetable();
  }

  private changeColour = async (course: Course, colour: string) => {
    await this.props.dispatch(setColour(course.id, colour));
  }

  private toggleWebStream = async (course: Course) => {
    await this.props.dispatch(toggleWebStream(course));
    await this.updateTimetable();
  }

  private toggleEvent = async (event: CBSEvent) => {
    await this.props.dispatch(toggleEvent(event));
    await this.updateTimetable();
  }

  private toggleOption = async (option: OptionName) => {
    await this.props.dispatch(toggleOption(option));

    const generationOptions: OptionName[] = ['includeFull']
    if (generationOptions.includes(option)) {
      await this.updateTimetable();
    }
  }

  private updateTimetable = async () => {
    const sessionManager = new SessionManager(this.props.sessionManager);
    const sessions = sessionManager.orderSessions;
    const fixedSessions = sessions.filter(s => sessionManager.get(s.id).touched);
    const fixedLinkedSessions = fixedSessions.map(s => s.serialise());

    const newTimetable = doTimetableSearch({
      fixedSessions: fixedLinkedSessions,
      courses: this.allCourses,
      events: this.props.events,
      webStreams: this.props.webStreams,
      options: this.props.options,
    });

    removeOldSessions(sessionManager, this.allCourses);

    if (newTimetable === null) {
      // Displace some classes and display a warning
      await this.props.dispatch(setNotice('There was a problem generating a timetable'));
    } else {
      sessionManager.update(
        newTimetable.timetable,
        this.props.sessionFactory,
      );
      await this.props.dispatch(updateSessionManager(sessionManager.data));
      await this.props.dispatch(bumpTimetableVersion());

      if (newTimetable.unplaced.length > 0) {
        await this.props.dispatch(setNotice('Some classes have been displaced'));
      }
    }
  }

  private editCustomCourse = (course: CustomCourse) => {
    this.setState({ editingCourse: course });
  }

  private handleClearEditing = () => {
    this.setState({ editingCourse: null });
  }
}

const removeOldSessions = (sessionManager: SessionManager, courses: Course[]) => {
  const courseIds = courses.map(c => c.id);
  for (let sid of sessionManager.order) {
    if (!courseIds.includes(sid)) {
      sessionManager.remove(sid);
    }
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const courseSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);
  const sessionFactory = new SessionFactory(state.courses);

  return {
    courses: state.courses,
    sessionFactory: sessionFactory,
    courseList: state.courses.official,
    chosen: state.chosen.map(cid => isSet(state.courses.get(cid))).sort(courseSort),
    events: state.events,
    options: state.options,
    sessionManager: hydrateLinkedSessionManager(state.sessionManager, sessionFactory),
    colours: state.colours,
    webStreams: state.webStreams,
  }
}

const connection = connect(mapStateToProps);
export default withStyles(styles)(connection(CourseSelection));
