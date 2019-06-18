import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from '../state';
import { Course } from "../state/Course";
import { addCourse, toggleWebStream } from '../actions/selection';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import Autocomplete from '../components/Autocomplete';
import CourseDisplay from '../components/CourseDisplay';

const styles = (theme: Theme) => createStyles({

});

export interface OwnProps extends WithStyles<typeof styles> {

}

export interface StateProps {
  courses: Course[];
  chosen: Course[];
  additional: Course[];
}

export interface DispatchProps {
  chooseCourse: (course: Course | null | undefined) => void;
  toggleWebStream: (course: Course | null | undefined) => void;
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {
}

class CourseSelection extends Component<Props, State> {
  state = {
  }

  render () {
    console.log();
    return (
      <React.Fragment>
        <Autocomplete
          courses={this.props.courses}
          chosen={this.props.chosen}
          additional={this.props.additional}
          chooseCourse={this.props.chooseCourse}
        />

        <CourseDisplay
          chosen={this.props.chosen}
          additional={this.props.additional}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  return {
    courses: state.courses,
    chosen: state.chosen,
    additional: state.additional,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    chooseCourse: async (course: Course | null | undefined) => {
      if (course) {
        await dispatch(addCourse(course));
      }
    },
    toggleWebStream: async (course: Course | null | undefined) => {
      if (course) {
        await dispatch(toggleWebStream(course));
      }
    },
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(CourseSelection));
