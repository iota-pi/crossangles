import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  RootState,
  CBSEvent,
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
import { WithDispatch } from '../typeHelpers';

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
import { SessionManager, SessionManagerData } from '../components/Timetable/SessionManager';
import { CourseMap, CourseData, CourseId, CBS_CODE, getCourseId } from '../state/Course';
import { Options, OptionName } from '../state/Options';
import { ColourMap, Colour } from '../state/Colours';
import { ClassTime } from '../state/Stream';

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
  courses: CourseMap,
  courseList: CourseData[],
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: CBSEvent[],
  options: Options,
  timetable: SessionManagerData,
  colours: ColourMap,
  webStreams: CourseId[],
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  editingCourse: CourseData | null,
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
              additional={this.props.additional}
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
            cbs={this.props.courses[CBS_CODE]}
            chosen={this.props.chosen}
            custom={this.props.custom}
            additional={this.props.additional}
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

  private chooseCourse = async (course: CourseData) => {
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable();
  }

  private addCustom = async (name: string, times: ClassTime[]) => {
    let course: CourseData;
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
      course = {
        ...this.state.editingCourse,
        ...updatedValues,
      };
      await this.props.dispatch(updateCustom(
        this.state.editingCourse,
        updatedValues,
      ));
    } else {
      course = {
        code: 'custom_' + Math.random(),
        isCustom: true,
        ...updatedValues,
      };
      await this.props.dispatch(addCustom(course));
      await this.props.dispatch(setColour(getCourseId(course)));
    }

    await this.updateTimetable();
    this.setState({ editingCourse: null }); // TODO replace with after close in CreateCustom
  }

  private removeCourse = async (course: CourseData) => {
    if (course.isCustom) {
      await this.props.dispatch(removeCustom(course));
    } else {
      await this.props.dispatch(removeCourse(course));
    }
    await this.updateTimetable();
  }

  private changeColour = async (course: CourseData, colour: Colour) => {
    await this.props.dispatch(setColour(getCourseId(course), colour));
  }

  private toggleWebStream = async (course: CourseData) => {
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
    const sessionManager = SessionManager.from(this.props.timetable, this.props.courses);
    const sessions = sessionManager.orderSessions;
    const fixedSessions = sessions.filter(s => sessionManager.get(s.id).touched);
    // const fixedLinkedSessions = fixedSessions.map(s => unlinkSession(s));

    const newTimetable = doTimetableSearch({
      fixedSessions,
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
      sessionManager.update(newTimetable.timetable);
      await this.props.dispatch(updateSessionManager(sessionManager.data));
      await this.props.dispatch(bumpTimetableVersion());

      if (newTimetable.unplaced.length > 0) {
        await this.props.dispatch(setNotice('Some classes have been displaced'));
      }
    }
  }

  private editCustomCourse = (course: CourseData) => {
    this.setState({ editingCourse: course });
  }

  private handleClearEditing = () => {
    this.setState({ editingCourse: null });
  }

  // private linkTimetable = (timetable: SessionData[]): LinkedSession[] => {
  //   const linkedTimetable = timetable.map(session => {
  //     const course = this.props.courses[session.course];
  //     const stream = getStream(course, session.stream);
  //     return linkSession(course, stream, session)
  //   });

  //   return linkedTimetable;
  // }
}

const removeOldSessions = (sessionManager: SessionManager, courses: CourseData[]) => {
  const courseIds = courses.map(c => getCourseId(c));
  for (let sid of sessionManager.order) {
    if (!courseIds.includes(sid)) {
      sessionManager.remove(sid);
    }
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);
  const customSort = (a: CourseData, b: CourseData) => +(a.name > b.name) - +(a.name < b.name);

  return {
    courses: state.courses,
    courseList: Object.values(state.courses),
    chosen: state.chosen.map(c => state.courses[c]).sort(courseSort),
    custom: state.custom.map(c => state.courses[c]).sort(customSort),
    additional: state.additional.map(c => state.courses[c]).sort(courseSort),
    events: state.events,
    options: state.options,
    timetable: state.timetable,
    colours: state.colours,
    webStreams: state.webStreams,
  }
}

const connection = connect(mapStateToProps);
export default withStyles(styles)(connection(CourseSelection));
