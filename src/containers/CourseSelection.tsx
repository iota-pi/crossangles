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
  addCustom,
  removeCustom,
  updateCustom,
  setSuggestionScore,
} from '../actions';
import { updateTimetable } from '../actions';
import { WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import Autocomplete from '../components/Autocomplete';
import CourseDisplay from '../components/CourseList';
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

  private get allChosenCourses () {
    return [
      ...this.props.chosen,
      ...this.props.custom,
      ...this.props.additional,
    ];
  }

  private chooseCourse = async (course: CourseData) => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable(sessionManager);
  }

  private addCustom = async (name: string, times: ClassTime[]) => {
    const sessionManager = this.getSessionManager();
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
      await this.props.dispatch(updateCustom(course));
    } else {
      course = {
        code: 'custom_' + Math.random(),
        isCustom: true,
        ...updatedValues,
      };
      await this.props.dispatch(addCustom(course));
      await this.props.dispatch(setColour(getCourseId(course)));
    }

    await this.updateTimetable(sessionManager);
    this.setState({ editingCourse: null }); // TODO replace with after close in CreateCustom
  }

  private removeCourse = async (course: CourseData) => {
    const sessionManager = this.getSessionManager();
    if (course.isCustom) {
      await this.props.dispatch(removeCustom(course));
    } else {
      await this.props.dispatch(removeCourse(course));
    }
    await this.updateTimetable(sessionManager);
  }

  private changeColour = async (course: CourseData, colour: Colour) => {
    await this.props.dispatch(setColour(getCourseId(course), colour));
  }

  private toggleWebStream = async (course: CourseData) => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(toggleWebStream(course));
    await this.updateTimetable(sessionManager);
  }

  private toggleEvent = async (event: CBSEvent) => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(toggleEvent(event));
    await this.updateTimetable(sessionManager);
  }

  private toggleOption = async (option: OptionName) => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(toggleOption(option));

    const generationOptions: OptionName[] = ['includeFull']
    if (generationOptions.includes(option)) {
      await this.updateTimetable(sessionManager);
    }
  }

  private getSessionManager = () => {
    return SessionManager.from(this.props.timetable, this.props.courses);
  }

  private updateTimetable = async (sessionManager: SessionManager) => {
    const fixedSessions = sessionManager.getFixedSessions(this.allChosenCourses, this.props.events);

    const newTimetable = doTimetableSearch({
      fixedSessions,
      courses: this.allChosenCourses,
      events: this.props.events,
      webStreams: this.props.webStreams,
      options: this.props.options,
    });

    if (newTimetable === null) {
      // Displace some classes and display a warning
      await this.props.dispatch(setNotice('There was a problem generating a timetable'));
    } else {
      sessionManager.update(newTimetable.timetable, fixedSessions, newTimetable.score);
      await this.props.dispatch(updateTimetable(sessionManager.data));

      if (newTimetable.unplaced && newTimetable.unplaced.length > 0) {
        await this.props.dispatch(setNotice('Some classes have been displaced'));
      }

      // If we had some fixed session constraints, try calculate a more optimal
      // timetable (if there is one)
      if (fixedSessions.length > 0) {
        this.recommendTimetable();
      }
    }
  }

  private editCustomCourse = (course: CourseData) => {
    this.setState({ editingCourse: course });
  }

  private handleClearEditing = () => {
    this.setState({ editingCourse: null });
  }

  private recommendTimetable = async () => {
    const newTimetable = doTimetableSearch({
      fixedSessions: [],
      courses: this.allChosenCourses,
      events: this.props.events,
      webStreams: this.props.webStreams,
      options: this.props.options,
    });

    if (newTimetable !== null) {
      await this.props.dispatch(setSuggestionScore(newTimetable.score));
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
