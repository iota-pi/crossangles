import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState, Meta, Notice } from './state';
import { Course } from "./state/Course";

// Theme
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import theme from './theme';

// Styles
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from './containers/AppBar';
import { ThunkDispatch } from 'redux-thunk';
import { fetchData } from './actions/fetch';
import Container from '@material-ui/core/Container';
import CourseSelection from './containers/CourseSelection';
import TimetableContainer from './containers/TimetableContainer';
import { Snackbar } from '@material-ui/core';
import { clearNotice } from './actions';

const styles = (theme: Theme) => createStyles({
  appBarSpacer: {
    ...theme.mixins.toolbar,
    marginBottom: theme.spacing(2),
  },
  spaceBelow: {
    marginBottom: theme.spacing(8),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {

}

export interface StateProps {
  courses: Course[],
  meta: Meta,
  notice: Notice | null,
}

export interface DispatchProps {
  getData: () => void,
  clearNotice: () => void,
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {
}

class App extends Component<Props, State> {
  state = {
  }

  render () {
    const classes = this.props.classes;
    return (
      <ThemeProvider theme={theme}>
        <div>
          <CssBaseline/>
          <AppBar/>
          <div className={classes.appBarSpacer} />

          <Container
            maxWidth="md"
            className={classes.spaceBelow}
          >
            <CourseSelection />

            <TimetableContainer />
          </Container>

          <Snackbar
            key={this.props.notice ? this.props.notice.message : ''}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={this.props.notice !== null}
            onClose={this.handleSnackbarClose}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            autoHideDuration={6000}
            message={(
              <span id="message-id">
                {this.props.notice ? this.props.notice.message : null}
              </span>
            )}
            action={this.props.notice ? this.props.notice.actions : null}
          />
        </div>
      </ThemeProvider>
    );
  }

  componentWillMount () {
    this.props.getData();
  }

  handleSnackbarClose = () => {
    this.props.clearNotice();
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  return {
    courses: Array.from(state.courses.values()),
    meta: state.meta,
    notice: state.notice,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    getData: async () => await dispatch(fetchData(process.env.REACT_APP_DATA_URI as string)),
    clearNotice: async () => await dispatch(clearNotice()),
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(App));
