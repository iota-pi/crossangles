import React, { Component } from 'react';
import { connect,  } from 'react-redux';
import {
  RootState,
  Course,
  CBSEvent,
  Options,
  OptionName,
  CourseId,
  Timetable,
  CustomCourse,
  LinkedTimetable,
  Session,
} from '../state';
import {
  addCourse,
  removeCourse,
  toggleWebStream,
  toggleEvent,
  toggleOption,
  doTimetableSearch,
  setNotice,
} from '../actions';
import { updateTimetable } from '../actions';
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

const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(2),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: Map<CourseId, Course>,
  courseList: Course[],
  chosen: Course[],
  additional: Course[],
  custom: CustomCourse[],
  events: CBSEvent[],
  options: Options,
  linkedTimetable: LinkedTimetable,
  colours: Map<CourseId, string>,
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {}

class CourseSelection extends Component<Props, State> {
  state = {
  }

  render () {
    const classes = this.props.classes;

    return (
      <React.Fragment>
        <Autocomplete
          courses={this.props.courseList}
          chosen={this.props.chosen}
          additional={this.props.additional}
          chooseCourse={this.chooseCourse}
          maxItems={20}
        />

        <div className={classes.spaceAbove}>
          <CourseDisplay
            chosen={this.props.chosen}
            additional={this.props.additional}
            events={this.props.events}
            colours={this.props.colours}
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
    return this.props.chosen.concat(this.props.custom, this.props.additional);
  }

  private chooseCourse = async (course: Course) => {
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable();
  }

  private removeCourse = async (course: Course) => {
    await this.props.dispatch(removeCourse(course));
    await this.updateTimetable();
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
    const newTimetable = doTimetableSearch({
      courses: this.allCourses,
      events: this.props.events,
      previousTimetable: this.timetable,
      options: this.props.options,
    });

    if (newTimetable === null) {
      // Displace some classes and display a warning
      await this.props.dispatch(setNotice('There was a problem generating a timetable'));
    } else if (!newTimetable.success) {
      await this.props.dispatch(setNotice('Some classes have been displaced'));
    } else {
      const linkedTimetable = newTimetable.timetable;
      await this.props.dispatch(updateTimetable(linkedTimetable));
    }
  }

  private changeColour = async (course: Course, colour: string) => {
    await this.props.dispatch(setColour(course.id, colour));
  }

  private get timetable (): Timetable {
    return this.props.linkedTimetable.map(s => Session.from(s, this.props.courses));
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  const chosenSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);

  return {
    courses: state.courses,
    courseList: Array.from(state.courses.values()),
    chosen: state.chosen.map(cid => isSet(state.courses.get(cid))).sort(chosenSort),
    custom: state.custom,
    additional: state.additional.map(cid => isSet(state.courses.get(cid))),
    events: state.events,
    options: state.options,
    linkedTimetable: state.timetable,
    colours: state.colours,
  }
}

const connection = connect(mapStateToProps);
export default withStyles(styles)(connection(CourseSelection));
