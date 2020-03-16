import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState } from '../state';
import { AdditionalEvent } from '../state/Events';
import {
  addCourse,
  removeCourse,
  toggleWebStream,
  toggleEvent,
  toggleOption,
  addCustom,
  removeCustom,
  updateCustom,
  toggleShowEvents,
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
import { setColour } from '../actions';
import CreateCustom from '../components/CreateCustom';
import { SessionManager, SessionManagerData } from '../components/Timetable/SessionManager';
import { CourseMap, CourseData, CourseId, getCourseId, courseSort, customSort } from '../state/Course';
import { Options, OptionName } from '../state/Options';
import { ColourMap, Colour } from '../state/Colours';
import { ClassTime } from '../state/Stream';
import { updateTimetable } from '../timetable/updateTimetable';
import { Meta } from '../state/Meta';

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
  meta: Meta,
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
            onToggleOption={this.toggleOption}
          />
        </div>
      </React.Fragment>
    );
  }

  private editCustomCourse = (course: CourseData) => {
    this.setState({ editingCourse: course });
  }

  private handleClearEditing = () => {
    this.setState({ editingCourse: null });
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

  private toggleShowEvents = async (course: CourseData) => {
    await this.props.dispatch(toggleShowEvents(getCourseId(course)));
  }

  private toggleEvent = async (event: AdditionalEvent) => {
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
    const { chosen, additional, custom, events, options, webStreams } = this.props;
    await updateTimetable({
      dispatch: this.props.dispatch,
      sessionManager,
      selection: { chosen, additional, custom, events, options, webStreams },
      searchConfig: {
        timeout: 100,
      },
    });
  }
}

const mapStateToProps = (state: RootState): StateProps => {
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
    hiddenEvents: state.hiddenEvents,
    meta: state.meta,
  }
}

const connection = connect(mapStateToProps);
export default withStyles(styles)(connection(CourseSelection));
