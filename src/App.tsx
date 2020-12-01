import React, {
  lazy, PureComponent, ReactNode, Suspense, ErrorInfo,
} from 'react';
import { connect, MapDispatchToPropsNonObject } from 'react-redux';
import ReactGA from 'react-ga';
import loadable from '@loadable/component';

// Theme
import { Theme } from '@material-ui/core/styles/createMuiTheme';

// Styles
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Skeleton from '@material-ui/lab/Skeleton';
import { initialiseGA, pageView, CATEGORY } from './analytics';
import { getCampus } from './getCampus';
import { clearNotice, setNotice } from './actions';
import {
  RootState,
  Meta,
  Notice,
  Options,
  ColourMap,
  CourseData,
  getOption,
} from './state';
import { getCurrentTimetable, getShowSignup, getAdditionalCourses } from './state/selectors';
import CourseSelection from './containers/CourseSelection';
import InfoText from './components/InfoText';
import { submitContact } from './submitContact';
import { SessionManagerData } from './components/Timetable/SessionManagerTypes';
import { saveAsImage, getScreenshotViewport } from './saveAsImage';

const AppBar = loadable(() => import('./components/AppBar'));
const TimetableContainer = lazy(() => import('./containers/TimetableContainer'));
const ActionButtons = loadable(() => import('./components/ActionButtons'));
const NoticeDisplay = loadable(() => import('./components/Notice'));
const ContactUs = loadable(() => import('./components/ContactUs'));

const styles = (theme: Theme) => createStyles({
  appBarSpacer: {
    ...theme.mixins.toolbar,
    marginBottom: theme.spacing(4),
  },
  spaceAbove: { marginTop: theme.spacing(8) },
  moderateSpaceAbove: { paddingTop: theme.spacing(4) },
  spaceBelow: { marginBottom: theme.spacing(8) },
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

class App extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showContact: false,
      isSavingImage: false,
    };
  }

  componentDidMount() {
    initialiseGA();
    pageView();
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const infoText = info.componentStack;

    ReactGA.exception({
      description: `Unhandled error catch by error boundary in App.\n${error.message}\n${error.stack}\n${infoText}`,
    });
    console.error(error);
    console.error(info);
  }

  private handleSaveAsImage = async () => {
    this.setState({ isSavingImage: true });

    ReactGA.event({
      category: CATEGORY,
      action: 'Save as Image',
    });

    const { timetable, colours, options } = this.props;
    const campus = getCampus();
    const viewport = getScreenshotViewport(timetable, getOption(options, 'compactView'));

    const promise = saveAsImage({
      timetable,
      colours,
      options,
      viewport,
      campus,
    });

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
  };

  private handleSnackbarClose = () => {
    this.props.clearNotice();
  };

  private handleContactShow = () => {
    this.setState({ showContact: true });
    ReactGA.modalview('contact-us');
  };

  private handleContactSend = async (name: string, email: string, message: string) => {
    const result = await submitContact({ name, email, message });

    if (result && result.status === 200 && result.data.error !== true) {
      this.props.setNotice('Success! Thanks for contacting us');
    } else {
      this.props.setNotice('Could not submit contact form');
    }

    this.setState({ showContact: false });
  };

  private handleContactClose = () => {
    this.setState({ showContact: false });
  };

  render() {
    const classes = this.props.classes;

    return (
      <div>
        <CssBaseline />

        <AppBar
          onShowContact={this.handleContactShow}
        />
        <div className={classes.appBarSpacer} />

        <Container
          maxWidth="md"
          className={classes.spaceBelow}
        >
          <CourseSelection />

          <div className={classes.moderateSpaceAbove}>
            <Suspense fallback={<Skeleton variant="rect" height={465} />}>
              <TimetableContainer
                isSavingImage={this.state.isSavingImage}
                onSaveAsImage={this.handleSaveAsImage}
              />
            </Suspense>
          </div>

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
              variant: 'body2',
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
}

const mapStateToProps = (state: RootState): StateProps => ({
  showSignup: getShowSignup(state),
  notice: state.notice,
  additional: getAdditionalCourses(state),
  meta: state.meta,
  timetable: getCurrentTimetable(state),
  colours: state.colours,
  options: state.options,
});

const mapDispatchToProps: MapDispatchToPropsNonObject<DispatchProps, OwnProps> = dispatch => ({
  setNotice: (message: string, actions?: ReactNode[]) => dispatch(setNotice(message, actions)),
  clearNotice: () => dispatch(clearNotice()),
});

const connection = connect(mapStateToProps, mapDispatchToProps);
const styledApp = withStyles(styles)(connection(App));
export default styledApp;
