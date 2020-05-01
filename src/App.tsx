import React, { Component, ReactNode } from 'react';
import { connect, Provider, MapDispatchToPropsNonObject } from 'react-redux';
import { RootState } from './state';
import { Meta } from './state/Meta';
import { Notice } from './state/Notice';
import { clearNotice, setNotice } from './actions/notice';
import loadable from '@loadable/component';

// Theme
import { Theme } from '@material-ui/core/styles/createMuiTheme';

// Styles
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from './containers/AppBar';
import Container from '@material-ui/core/Container';
import CourseSelection from './containers/CourseSelection';
import TimetableContainer from './containers/TimetableContainer';
import InfoText from './components/InfoText';
import { store, persistor } from './configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import { ActionButtons } from './components/ActionButtons';
import { getAutoSelectedEvents } from './state/Events';
import ContactUs from './components/ContactUs';
import { submitContact } from './submitContact';
import { SessionManagerData } from './components/Timetable/SessionManager';
import { saveAsImage, SaveAsImageRequest, getScreenshotViewport } from './saveAsImage';
import { Options } from './state/Options';
import { ColourMap } from './state/Colours';
import { fetchData } from './actions';
import { CourseData } from './state/Course';
import getCampus from './getCampus';
import { getCurrentTimetable } from './state/Timetable';

const NoticeDisplay = loadable(() => import('./components/Notice'));

const styles = (theme: Theme) => createStyles({
  appBarSpacer: {
    ...theme.mixins.toolbar,
    marginBottom: theme.spacing(4),
  },
  spaceAbove: {
    marginTop: theme.spacing(8),
  },
  spaceBelow: {
    marginBottom: theme.spacing(8),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {
}

export interface StateProps {
  showSignup: boolean,
  notice: Notice | null,
  additional: CourseData[],
  meta: Meta,
  timetable: SessionManagerData,
  colours: ColourMap,
  options: Options,
}

export interface DispatchProps {
  setNotice: (message: string, actions?: ReactNode[]) => void,
  clearNotice: () => void,
}

export type Props = OwnProps & StateProps & DispatchProps;

export interface State {
  showContact: boolean,
  isSavingImage: boolean,
}

store.dispatch(fetchData());

class App extends Component<Props, State> {
  state: State = {
    showContact: false,
    isSavingImage: false,
  }

  render () {
    const classes = this.props.classes;
    return (
      <div>
        <CssBaseline/>
        <AppBar onShowContact={this.handleContactShow} />
        <div className={classes.appBarSpacer} />

        <Container
          maxWidth="md"
          className={classes.spaceBelow}
        >
          <CourseSelection />

          <TimetableContainer />

          <ActionButtons
            additional={this.props.additional}
            meta={this.props.meta}
            disabled={this.props.timetable.order.length === 0}
            showSignup={this.props.showSignup}
            isSavingImage={this.state.isSavingImage}
            onSaveAsImage={this.handleSaveAsImage}
            className={classes.spaceAbove}
          />

          <InfoText
            additional={this.props.additional}
            meta={this.props.meta}
            className={classes.spaceAbove}
            typographyProps={{
              variant: "body2",
              style: { fontWeight: 300 },
            }}
            onShowContact={this.handleContactShow}
            link
            disclaimer
          />
        </Container>

        <NoticeDisplay
          notice={this.props.notice}
          onSnackbarClose={this.handleSnackbarClose}
        />

        <ContactUs
          open={this.state.showContact}
          onSend={this.handleContactSend}
          onClose={this.handleContactClose}
        />
      </div>
    );
  }

  private handleSaveAsImage = async () => {
    this.setState({ isSavingImage: true });

    const imageData: SaveAsImageRequest = {
      timetable: this.props.timetable,
      colours: this.props.colours,
      options: this.props.options,
      viewport: getScreenshotViewport(this.props.timetable),
      campus: getCampus(window.location.hostname),
    };

    saveAsImage(imageData).then(success => {
      if (!success) {
        this.props.setNotice('Could not save as image');
      }
    }).catch(err => {
      this.props.setNotice('Error while saving as image, please try again later');
      console.error(err);
    }).finally(() => {
      this.setState({ isSavingImage: false });
    });
  }

  private handleSnackbarClose = () => {
    this.props.clearNotice();
  }

  private handleContactShow = () => {
    this.setState({ showContact: true });
  }

  private handleContactSend = async (name: string, email: string, message: string) => {
    const result = await submitContact({ name, email, message });

    if (result && result.status === 200 && result.data.error !== true) {
      this.props.setNotice('Success! Thanks for contacting us');
    } else {
      this.props.setNotice('Could not submit contact form');
    }

    this.setState({ showContact: false });
  }

  private handleContactClose = () => {
    this.setState({ showContact: false });
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const events = getAutoSelectedEvents(state.courses, state.additional);

  return {
    showSignup: state.events.some(e => events.includes(e)),
    notice: state.notice,
    additional: state.additional.map(cid => state.courses[cid]),
    meta: state.meta,
    timetable: getCurrentTimetable(state),
    colours: state.colours,
    options: state.options,
  };
}

const mapDispatchToProps: MapDispatchToPropsNonObject<DispatchProps, OwnProps> = dispatch => {
  return {
    setNotice: async (message: string, actions?: ReactNode[]) => await dispatch(setNotice(message, actions)),
    clearNotice: async () => await dispatch(clearNotice()),
  }
}

const connection = connect(mapStateToProps, mapDispatchToProps);
const styledApp = withStyles(styles)(connection(App));

export function wrapApp(AppComponent: typeof styledApp) {
  return class AppWrapper extends Component {
    render () {
      return (
        <Provider store={store}>
          <PersistGate persistor={persistor} loading={null}>
            <AppComponent {...this.props} />
          </PersistGate>
        </Provider>
      );
    }
  }
}

export default wrapApp(styledApp);
