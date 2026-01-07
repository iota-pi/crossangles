import React, {
  ErrorInfo,
  lazy,
  PureComponent,
  Suspense,
} from 'react'
import { connect, MapDispatchToPropsNonObject } from 'react-redux'
import { exception, event, modalview } from 'react-ga'
import loadable from '@loadable/component'

// Theme
import { Theme } from '@material-ui/core/styles'

// Styles
import withStyles, { StyleRules, WithStyles } from '@material-ui/core/styles/withStyles'

// Components
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import Skeleton from '@material-ui/lab/Skeleton'
import Button from '@material-ui/core/Button'
import { initialiseGA, pageView, CATEGORY } from './analytics'
import { clearNotice, setChangelogView, setNotice, toggleOption } from './actions'
import {
  RootState,
  Meta,
  Notice,
  CourseData,
  getDefaultDarkMode,
  LinkedSession,
  CourseMap,
} from './state'
import { getCurrentTimetable, getShowSignup, getAdditionalCourses } from './state/selectors'
import CourseSelection from './containers/CourseSelection'
import InfoText from './components/InfoText'
import { submitContact } from './submitContact'
import { SessionManagerData } from './components/Timetable/SessionManagerTypes'
import changelog, { getUpdateMessage } from './changelog'
import { saveAsICS } from './saveAsICS'
import SessionManager from './components/Timetable/SessionManager'

const AppBar = loadable(() => import('./components/AppBar'))
const TimetableContainer = lazy(() => import('./containers/TimetableContainer'))
const ActionButtons = loadable(() => import('./components/ActionButtons'))
const NoticeDisplay = loadable(() => import('./components/Notice'))
const ContactUs = loadable(() => import('./components/ContactUs'))
const Changelog = loadable(() => import('./components/Changelog'))

const styles = (theme: Theme): StyleRules => ({
  appBarSpacer: {
    ...theme.mixins.toolbar,
    marginBottom: theme.spacing(4),
  },
  spaceAbove: { marginTop: theme.spacing(8) },
  moderateSpaceAbove: { paddingTop: theme.spacing(4) },
  spaceBelow: { marginBottom: theme.spacing(8) },
})

export interface OwnProps extends WithStyles<typeof styles> {
}

export interface StateProps {
  showSignup: boolean,
  notice: Notice | null,
  additional: CourseData[],
  meta: Meta,
  timetable: SessionManagerData,
  courses: CourseMap,
  changelogView: Date,
}

export interface DispatchProps {
  setNotice: typeof setNotice,
  clearNotice: () => void,
  initDarkMode: () => void,
  setChangelogView: () => void,
}

export type Props = OwnProps & StateProps & DispatchProps

export interface State {
  showChangelog: boolean,
  showContact: boolean,
  isSavingICS: boolean,
}

class App extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showChangelog: false,
      showContact: false,
      isSavingICS: false,
    }
  }

  componentDidMount() {
    initialiseGA()
    pageView()
    this.props.initDarkMode()
    this.checkChangelog()
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const infoText = info.componentStack

    exception({
      description: `Unhandled error catch by error boundary in App.\n${error.message}\n${error.stack}\n${infoText}`,
    })
    console.error(error)
    console.error(info)
  }

  private checkChangelog = () => {
    const newChanges = changelog.filter(
      item => !item.boring && item.date > this.props.changelogView,
    )
    if (newChanges.length) {
      const actions: React.ReactNode[] = [(
        <Button
          color="secondary"
          variant="text"
          key="go"
          onClick={async () => {
            this.props.clearNotice()
            this.handleChangelogShow()
          }}
        >
          See what&apos;s new
        </Button>
      )]
      this.props.setNotice(
        getUpdateMessage(newChanges.length),
        actions,
        undefined,
        () => this.props.setChangelogView(),
      )
    }
  }

  private handleSaveAsICS = () => {
    this.setState({ isSavingICS: true })

    event({
      category: CATEGORY,
      action: 'Save as ICS',
    })

    try {
      const timetable = SessionManager.from(this.props.timetable, this.props.courses)

      const meta = this.props.meta
      const sessions: LinkedSession[] = []
      for (const sid of timetable.renderOrder) {
        const placement = timetable.getMaybe(sid)
        if (!placement) continue
        sessions.push(placement.session)
      }
      saveAsICS({ sessions, meta })
    } finally {
      this.setState({ isSavingICS: false })
    }
  }

  private handleSnackbarClose = () => {
    this.props.clearNotice()
  }

  private handleContactShow = () => {
    this.setState({ showContact: true })
    modalview('contact-us')
  }

  private handleContactSend = async (name: string, email: string, message: string) => {
    const result = await submitContact({ name, email, message })

    if (result && result.status === 200 && result.data.error !== true) {
      this.props.setNotice('Success! Thanks for contacting us')
    } else {
      this.props.setNotice('Could not submit contact form')
    }

    this.setState({ showContact: false })
  }

  private handleContactClose = () => {
    this.setState({ showContact: false })
  }

  private handleChangelogShow = () => {
    this.setState({ showChangelog: true })
  }

  private handleChangelogClose = () => {
    this.setState({ showChangelog: false })
  }

  render() {
    const classes = this.props.classes

    return (
      <div>
        <CssBaseline />

        <AppBar
          onShowContact={this.handleContactShow}
          onViewChangelog={this.handleChangelogShow}
        />
        <div className={classes.appBarSpacer} />

        <Container
          maxWidth="md"
          className={classes.spaceBelow}
        >
          <CourseSelection />

          <div className={classes.moderateSpaceAbove}>
            <Suspense fallback={<Skeleton variant="rect" height={465} />}>
              <TimetableContainer />
            </Suspense>
          </div>

          <ActionButtons
            additional={this.props.additional}
            meta={this.props.meta}
            disabled={this.props.timetable.order.length === 0}
            showSignup={this.props.showSignup}
            isSavingICS={this.state.isSavingICS}
            onSaveAsICS={this.handleSaveAsICS}
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

        <Changelog
          open={this.state.showChangelog}
          onClose={this.handleChangelogClose}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  showSignup: getShowSignup(state),
  notice: state.notice,
  additional: getAdditionalCourses(state),
  meta: state.meta,
  timetable: getCurrentTimetable(state),
  courses: state.courses,
  changelogView: state.changelogView,
})

const mapDispatchToProps: MapDispatchToPropsNonObject<DispatchProps, OwnProps> = dispatch => ({
  setNotice: (...args) => dispatch(setNotice(...args)),
  clearNotice: () => dispatch(clearNotice()),
  initDarkMode: () => {
    if (getDefaultDarkMode()) {
      dispatch(toggleOption('darkMode', true))
    }
  },
  setChangelogView: () => dispatch(setChangelogView()),
})

const connection = connect(mapStateToProps, mapDispatchToProps)
const styledApp = withStyles(styles)(connection(App))
export default styledApp
