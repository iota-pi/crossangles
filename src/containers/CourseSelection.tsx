import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState, Course, CBSEvent, Options, OptionName } from '../state';
import { addCourse, removeCourse, toggleWebStream, toggleEvent, toggleOption } from '../actions';
import { isSet } from '../typeHelpers';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import Autocomplete from '../components/Autocomplete';
import CourseDisplay from '../components/CourseDisplay';
import GeneralOptions from '../components/GeneralOptions';

const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(2),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: Course[];
  chosen: Course[];
  additional: Course[];
  events: CBSEvent[];
  options: Options;
}

export interface DispatchProps {
  chooseCourse: (course: Course) => void;
  removeCourse: (course: Course) => void;
  toggleWebStream: (course: Course) => void;
  toggleEvent: (course: CBSEvent) => void;
  toggleOption: (course: OptionName) => void;
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {}

class CourseSelection extends Component<Props, State> {
  state = {
  }

  render () {
    const classes = this.props.classes;

    return (
      <React.Fragment>
        <Autocomplete
          courses={this.props.courses}
          chosen={this.props.chosen}
          additional={this.props.additional}
          chooseCourse={this.props.chooseCourse}
          maxItems={20}
        />

        <div className={classes.spaceAbove}>
          <CourseDisplay
            chosen={this.props.chosen}
            additional={this.props.additional}
            events={this.props.events}
            onRemoveCourse={this.props.removeCourse}
            onToggleEvent={this.props.toggleEvent}
            onToggleWeb={this.props.toggleWebStream}
          />
        </div>

        <div className={classes.spaceAbove}>
          <GeneralOptions
            options={this.props.options}
            onToggleOption={this.props.toggleOption}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  const chosenSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);

  return {
    courses: Array.from(state.courses.values()),
    chosen: state.chosen.map(cid => isSet(state.courses.get(cid))).sort(chosenSort),
    additional: state.additional.map(cid => isSet(state.courses.get(cid))),
    events: state.events,
    options: state.options,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    chooseCourse: async (course: Course) => await dispatch(addCourse(course)),
    removeCourse: async (course: Course) => await dispatch(removeCourse(course)),
    toggleWebStream: async (course: Course) => await dispatch(toggleWebStream(course)),
    toggleEvent: async (event: CBSEvent) => await dispatch(toggleEvent(event)),
    toggleOption: async (option: OptionName) => await dispatch(toggleOption(option)),
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(CourseSelection));
