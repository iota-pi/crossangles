import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import {
  AdditionalEvent,
  ColourMap,
  Colour,
  CourseMap,
  CourseData,
  CourseId,
  getCourseId,
  getAdditionalCourses,
  getChosenCourses,
  getCourseList,
  getCustomCourses,
  getCurrentTimetable,
  Meta,
  Options,
  OptionName,
  RootState,
} from '../state';
import {
  addCourse,
  removeCourse,
  toggleWebStream,
  toggleEvent,
  toggleOption,
  toggleShowEvents,
  setColour,
} from '../actions';
import { WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import Autocomplete from '../components/Autocomplete';
import CourseList from '../components/CourseList';
import GeneralOptions from '../components/GeneralOptions';
import CreateCustom from '../components/CreateCustom';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { updateTimetable } from '../timetable/updateTimetable';


const styles = (theme: Theme) => createStyles({
  slightSpaceAbove: {
    paddingTop: theme.spacing(2),
  },
  spaceAbove: {
    paddingTop: theme.spacing(4),
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
  events: AdditionalEvent[],
  options: Options,
  timetable: SessionManagerData,
  colours: ColourMap,
  webStreams: CourseId[],
  hiddenEvents: CourseId[],
  darkMode: boolean,
  meta: Meta,
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  editingCourse: CourseData | null,
  showCreateCustom: boolean,
}

class CourseSelection extends Component<Props, State> {
  state: State = {
    editingCourse: null,
    showCreateCustom: false,
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
        </div>

        <div className={classes.slightSpaceAbove}>
          <CourseList
            chosen={this.props.chosen}
            custom={this.props.custom}
            additional={this.props.additional}
            events={this.props.events}
            colours={this.props.colours}
            webStreams={this.props.webStreams}
            hiddenEvents={this.props.hiddenEvents}
            meta={this.props.meta}
            options={this.props.options}
            onEditCustomCourse={this.editCustomCourse}
            onRemoveCourse={this.removeCourse}
            onToggleShowEvents={this.toggleShowEvents}
            onToggleEvent={this.toggleEvent}
            onToggleWeb={this.toggleWebStream}
            onColourChange={this.changeColour}
          />
        </div>

        <div className={classes.spaceAbove}>
          <GeneralOptions
            options={this.props.options}
            darkMode={this.props.darkMode}
            onToggleOption={this.toggleOption}
          />
        </div>

        <CreateCustom
          open={this.state.showCreateCustom}
          editing={this.state.editingCourse}
          onSave={this.addCustom}
          onClose={this.handleCloseCustom}
          onExited={this.handleExitedCustom}
        />
      </React.Fragment>
    );
  }

  private editCustomCourse = (course: CourseData) => {
    this.setState({ editingCourse: course, showCreateCustom: true });
  }

  private handleCloseCustom = () => {
    this.setState({ showCreateCustom: false });
  }

  private handleExitedCustom = () => {
    this.setState({ editingCourse: null });
  }

  private chooseCourse = async (course: CourseData) => {
    // NB: getSessionManager should come *before* any dispatches in these methods
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable(sessionManager);
  }

  private addCustom = async (courseData: Omit<CourseData, 'code'>) => {
    const sessionManager = this.getSessionManager();

    let course: CourseData = {
      ...this.state.editingCourse!,
      ...courseData,
    };
    await this.props.dispatch(addCourse(course));

    await this.updateTimetable(sessionManager);
  }

  private removeCourse = async (course: CourseData) => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(removeCourse(course));
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

  private toggleShowEvents = async (course: CourseData) => {
    await this.props.dispatch(toggleShowEvents(getCourseId(course)));
  }

  private toggleEvent = async (event: AdditionalEvent) => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(toggleEvent(event));
    await this.updateTimetable(sessionManager);
  }

  private toggleOption = async (option: OptionName) => {
    const generationOptions: OptionName[] = ['includeFull'];
    let sessionManager: SessionManager | null = null;
    if (generationOptions.includes(option)) {
      sessionManager = this.getSessionManager();
    }

    await this.props.dispatch(toggleOption(option));

    if (sessionManager) {
      await this.updateTimetable(sessionManager);
    }
  }

  private getSessionManager = () => {
    try {
      return SessionManager.from(this.props.timetable, this.props.courses);
    } catch (error) {
      ReactGA.exception({
        description: 'Could not process timetable data. ' + error,
      });
      console.error('Could not process timetable data', this.props.timetable, this.props.courses);
      return new SessionManager();
    }
  }

  private updateTimetable = async (sessionManager: SessionManager) => {
    const { chosen, additional, custom, events, options, webStreams, meta } = this.props;
    await updateTimetable({
      dispatch: this.props.dispatch,
      sessionManager,
      selection: { chosen, additional, custom, events, options, webStreams, meta },
      searchConfig: {
        timeout: 100,
      },
    });
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    courses: state.courses,
    courseList: getCourseList(state),
    chosen: getChosenCourses(state),
    custom: getCustomCourses(state),
    additional: getAdditionalCourses(state),
    events: state.events,
    options: state.options,
    timetable: getCurrentTimetable(state),
    colours: state.colours,
    webStreams: state.webStreams,
    hiddenEvents: state.hiddenEvents,
    meta: state.meta,
    darkMode: state.darkMode,
  };
}

const connection = connect(mapStateToProps);
export default withStyles(styles)(connection(CourseSelection));
