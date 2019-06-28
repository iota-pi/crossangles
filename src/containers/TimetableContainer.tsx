import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState, Course, CBSEvent, Options, Timetable, CustomCourse } from '../state';
import { updateTimetable, UpdateTimetableConfig } from '../actions';
import { isSet } from '../typeHelpers';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Button } from '@material-ui/core';


const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(2),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: Course[];
  chosen: Course[];
  custom: CustomCourse[];
  additional: Course[];
  events: CBSEvent[];
  options: Options;
  timetable: Timetable;
}

export interface DispatchProps {
  updateTimetable: (config: UpdateTimetableConfig) => void;
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {}

class TimetableContainer extends Component<Props, State> {
  state = {
  }

  render () {
    // const classes = this.props.classes;

    return (
      <React.Fragment>
        <Button variant="outlined" color="primary" onClick={this.handleTimetableUpdate}>
          Click
        </Button>
      </React.Fragment>
    );
  }

  shouldComponentUpdate (prevProps: Props) {
    if (this.props.courses !== prevProps.courses || this.props.chosen !== prevProps.chosen || this.props.events !== prevProps.events || this.props.options !== prevProps.options || this.props.additional !== prevProps.additional) {

      return true;
    }

    return false;
  }

  handleTimetableUpdate = () => {
    const allCourses = this.props.chosen.concat(this.props.custom, this.props.additional)
    this.props.updateTimetable({
      courses: allCourses,
      events: this.props.events,
      previousTimetable: this.props.timetable,
      options: this.props.options,
    })
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  const chosenSort = (a: Course, b: Course) => +(a.code > b.code) - +(a.code < b.code);

  return {
    courses: Array.from(state.courses.values()),
    chosen: state.chosen.map(cid => isSet(state.courses.get(cid))).sort(chosenSort),
    custom: state.custom,
    additional: state.additional.map(cid => isSet(state.courses.get(cid))),
    events: state.events,
    options: state.options,
    timetable: state.timetable,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    updateTimetable: async (config: UpdateTimetableConfig) => await dispatch(updateTimetable(config)),
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(TimetableContainer));
