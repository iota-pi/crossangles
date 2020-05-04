import React, { Component, ReactNode } from 'react';
import { connect, Provider, MapDispatchToPropsNonObject } from 'react-redux';
import loadable from '@loadable/component';
import ReactGA from 'react-ga';
import { RootState } from './state';
import { Meta } from './state/Meta';
import { Notice } from './state/Notice';
import { getAutoSelectedEvents } from './state/Events';
import { Options } from './state/Options';
import { ColourMap } from './state/Colours';
import { CourseData } from './state/Course';
import { getCurrentTimetable } from './state/Timetable';
import { fetchData } from './actions';
import { clearNotice, setNotice } from './actions/notice';
import getCampus from './getCampus';
import { initialiseGA, pageView, CATEGORY } from './analytics';

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
import ContactUs from './components/ContactUs';
import { submitContact } from './submitContact';
import { SessionManagerData } from './components/Timetable/SessionManager';
import { saveAsImage, getScreenshotViewport } from './saveAsImage';

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

  componentDidMount () {
    initialiseGA();
    pageView();
  }

  private handleSaveAsImage = async () => {
    this.setState({ isSavingImage: true });

    ReactGA.event({
      category: CATEGORY,
      action: 'Save as Image',
    });

    const { timetable, colours, options } = this.props;
    const campus = getCampus(window.location.hostname);
    const viewport = getScreenshotViewport(this.props.timetable);

    const promise = saveAsImage({ timetable, colours, options, viewport, campus });

    promise.then(success => {
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
    ReactGA.modalview('contact-us');
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
  return {
    showSignup: getShowSignup(state),
    notice: state.notice,
    additional: state.additional.map(cid => state.courses[cid]),
    meta: state.meta,
    timetable: getCurrentTimetable(state),
    colours: state.colours,
    options: state.options,
  };
}

const getShowSignup = (state: Pick<RootState, 'courses' | 'additional' | 'events'>): boolean => {
  let events = getAutoSelectedEvents(state.courses, state.additional);
  const eventNames = events.map(e => e.id);
  return state.events.some(e => eventNames.includes(e.id))
}

const mapDispatchToProps: MapDispatchToPropsNonObject<DispatchProps, OwnProps> = dispatch => {
  return {
    setNotice: (message: string, actions?: ReactNode[]) => dispatch(setNotice(message, actions)),
    clearNotice: () => dispatch(clearNotice()),
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
