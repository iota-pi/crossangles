import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from '../state';
import { Course } from "../state/Course";

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import Typography from '@material-ui/core/Typography';

const styles = (theme: Theme) => createStyles({

});

export interface OwnProps extends WithStyles<typeof styles> {

}

export interface StateProps {
  courses: Course[];
}

export interface DispatchProps {
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {
}

class App extends Component<Props, State> {
  state = {
  }

  render () {
    console.log();
    return (
      <React.Fragment>

      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  return {
    courses: state.courses,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(App));
