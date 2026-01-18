import { lazy, PureComponent, Suspense } from 'react'
import { connect } from 'react-redux'
import { exception } from 'react-ga'
import { Theme } from '@mui/material/styles'
import { withStyles } from 'tss-react/mui'
import Skeleton from '@mui/material/Skeleton'

import {
  AdditionalEvent,
  ColourMap,
  Colour,
  CourseMap,
  CourseData,
  CourseId,
  getCourseId,
  Meta,
  Options,
  OptionName,
  RootState,
  hasWebStream,
} from '../state'
import {
  getAdditionalCourses,
  getChosenCourses,
  getCourseList,
  getCustomCourses,
  getCurrentTimetable,
} from '../state/selectors'
import {
  addCourse,
  removeCourse,
  toggleWebStream,
  toggleEvent,
  toggleOption,
  toggleShowEvents,
  setColour,
} from '../actions'
import { WithDispatch } from '../typeHelpers'
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager'
import { updateTimetable } from '../timetable/updateTimetable'
import { getCustomCode } from '../components/Timetable/timetableUtil'
import { TimetableScoreConfig } from '../timetable/scoreTimetable'

const Autocomplete = lazy(() => import('../components/Autocomplete'))
const CourseList = lazy(() => import('../components/CourseList'))
const TimetableOptions = lazy(() => import('../components/TimetableOptions'))
const CreateCustom = lazy(() => import('../components/CreateCustom'))


const styles = (theme: Theme) => ({
  slightSpaceAbove: {
    paddingTop: theme.spacing(2),
  },
  spaceAbove: {
    paddingTop: theme.spacing(4),
  },
  flex: {
    display: 'flex',
  },
  flexGrow: {
    flexGrow: 1,
  },
})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type OwnProps = {}

export interface StateProps {
  additional: CourseData[],
  chosen: CourseData[],
  colours: ColourMap,
  courseList: CourseData[],
  courses: CourseMap,
  custom: CourseData[],
  events: AdditionalEvent[],
  hiddenEvents: CourseId[],
  meta: Meta,
  options: Options,
  timetable: SessionManagerData,
  scoreConfig: TimetableScoreConfig,
  webStreams: CourseId[],
}

export type Props = WithDispatch<OwnProps & StateProps> & { classes: Record<keyof ReturnType<typeof styles>, string> }

export interface State {
  defaultName: string | null,
  editingCourse: CourseData | null,
  showCreateCustom: boolean,
}

const courseHeight = 52
const webStreamHeight = 34
const eventsHeight = 32

class CourseSelection extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      defaultName: null,
      editingCourse: null,
      showCreateCustom: false,
    }
  }

  private get courseListSkeletonHeight() {
    const { chosen, additional, custom, hiddenEvents } = this.props
    const courseCount = chosen.length + additional.length + custom.length
    const webStreamCount = chosen.filter(c => hasWebStream(c)).length
    const eventsCount = additional.length - hiddenEvents.length
    return (
      courseHeight * courseCount
      + webStreamHeight * webStreamCount
      + eventsHeight * eventsCount
    )
  }

  private handleAddCustomCourse = (title: string) => {
    this.setState({ editingCourse: null, defaultName: title, showCreateCustom: true })
  }

  private editCustomCourse = (course: CourseData) => {
    this.setState({ editingCourse: course, defaultName: null, showCreateCustom: true })
  }

  private handleCloseCustom = () => {
    this.setState({ showCreateCustom: false })
  }

  private handleExitedCustom = () => {
    this.setState({ editingCourse: null, defaultName: null })
  }

  private chooseCourse = async (course: CourseData) => {
    // NB: getSessionManager should come *before* any dispatches in these methods
    const sessionManager = this.getSessionManager()
    await this.props.dispatch(addCourse(course))
    await this.updateTimetable(sessionManager)
  }

  private addCustom = async (courseData: Omit<CourseData, 'code'>) => {
    const sessionManager = this.getSessionManager()
    const baseData = this.state.editingCourse || {
      code: getCustomCode(),
      isCustom: true,
    }

    const course: CourseData = {
      ...baseData,
      ...courseData,
    }
    await this.props.dispatch(addCourse(course))
    await this.updateTimetable(sessionManager)
  }

  private removeCourse = async (course: CourseData) => {
    const sessionManager = this.getSessionManager()
    await this.props.dispatch(removeCourse(course))
    await this.updateTimetable(sessionManager)
  }

  private changeColour = async (course: CourseData, colour: Colour) => {
    await this.props.dispatch(setColour(getCourseId(course), colour))
  }

  private toggleWebStream = async (course: CourseData) => {
    const sessionManager = this.getSessionManager()
    await this.props.dispatch(toggleWebStream(course))
    await this.updateTimetable(sessionManager)
  }

  private toggleShowEvents = async (course: CourseData) => {
    await this.props.dispatch(toggleShowEvents(getCourseId(course)))
  }

  private toggleEvent = async (event: AdditionalEvent) => {
    const sessionManager = this.getSessionManager()
    await this.props.dispatch(toggleEvent(event))
    await this.updateTimetable(sessionManager)
  }

  private toggleOption = async (option: OptionName) => {
    const generationOptions: OptionName[] = ['includeFull']
    let sessionManager: SessionManager | null = null
    if (generationOptions.includes(option)) {
      sessionManager = this.getSessionManager()
    }

    await this.props.dispatch(toggleOption(option))

    if (sessionManager) {
      await this.updateTimetable(sessionManager)
    }
  }

  private getSessionManager = () => {
    try {
      return SessionManager.from(this.props.timetable, this.props.courses)
    } catch (error) {
      exception({ description: `Could not process timetable data. ${error}` })
      console.error('Could not process timetable data', this.props.timetable, this.props.courses)
      return new SessionManager()
    }
  }

  private updateTimetable = async (sessionManager: SessionManager) => {
    const {
      additional,
      chosen,
      custom,
      events,
      meta,
      options,
      webStreams,
      scoreConfig,
    } = this.props
    await updateTimetable({
      dispatch: this.props.dispatch,
      sessionManager,
      selection: {
        chosen, additional, custom, events, options, webStreams, meta,
      },
      searchConfig: { timeout: 100 },
      scoreConfig,
    })
  }

  render() {
    const classes = this.props.classes

    return (
      <>
        <div className={classes.flex}>
          <div className={classes.flexGrow}>
            <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
              <Autocomplete
                courses={this.props.courseList}
                chosen={this.props.chosen}
                additional={this.props.additional}
                chooseCourse={this.chooseCourse}
                onAddPersonalEvent={this.handleAddCustomCourse}
              />
            </Suspense>
          </div>
        </div>

        <div className={classes.slightSpaceAbove}>
          <Suspense fallback={<Skeleton variant="rectangular" height={this.courseListSkeletonHeight} />}>
            <CourseList
              chosen={this.props.chosen}
              custom={this.props.custom}
              additional={this.props.additional}
              events={this.props.events}
              colours={this.props.colours}
              webStreams={this.props.webStreams}
              hiddenEvents={this.props.hiddenEvents}
              meta={this.props.meta}
              onEditCustomCourse={this.editCustomCourse}
              onRemoveCourse={this.removeCourse}
              onToggleShowEvents={this.toggleShowEvents}
              onToggleEvent={this.toggleEvent}
              onToggleWeb={this.toggleWebStream}
              onColourChange={this.changeColour}
            />
          </Suspense>
        </div>

        <div className={classes.spaceAbove}>
          <Suspense fallback={<div style={{ height: 34 }} />}>
            <TimetableOptions
              options={this.props.options}
              onToggleOption={this.toggleOption}
            />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <CreateCustom
            open={this.state.showCreateCustom}
            editing={this.state.editingCourse}
            defaultName={this.state.defaultName}
            onSave={this.addCustom}
            onClose={this.handleCloseCustom}
            onExited={this.handleExitedCustom}
          />
        </Suspense>
      </>
    )
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  additional: getAdditionalCourses(state),
  chosen: getChosenCourses(state),
  colours: state.colours,
  courses: state.courses,
  courseList: getCourseList(state),
  custom: getCustomCourses(state),
  events: state.events,
  hiddenEvents: state.hiddenEvents,
  meta: state.meta,
  options: state.options,
  timetable: getCurrentTimetable(state),
  scoreConfig: state.scoreConfig,
  webStreams: state.webStreams,
})

const connection = connect(mapStateToProps)
export default withStyles(connection(CourseSelection), styles) as unknown as React.ComponentType<OwnProps>
