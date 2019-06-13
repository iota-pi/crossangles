import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState, Meta } from './state';
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
import Typography from '@material-ui/core/Typography';

const styles = (theme: Theme) => createStyles({

});

export interface OwnProps extends WithStyles<typeof styles> {

}

export interface StateProps {
  courses: Course[];
  meta: Meta;
}

export interface DispatchProps {
  getData: () => void;
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
      <ThemeProvider theme={theme}>
        <div>
          <CssBaseline/>
          <AppBar/>

          <Typography>
            Welcome! {this.props.meta && this.props.meta.term}
          </Typography>

        </div>
      </ThemeProvider>
    );
  }

  componentWillMount () {
    this.props.getData();
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => {
  return {
    courses: state.courses,
    meta: state.meta,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    getData: async () => {
      await dispatch(fetchData(process.env.REACT_APP_DATA_URI as string));
    }
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps);
export default withStyles(styles)(connected(App));
