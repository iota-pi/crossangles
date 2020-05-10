import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableControls from '../components/TimetableControls';
import TimetableTable from '../components/Timetable';
import CreateCustom from '../components/CreateCustom';

// General
import {
  AdditionalEvent,
  ColourMap,
  CourseData,
  CourseId,
  CourseMap,
  getCurrentTimetable,
  getChosenCourses,
  getCustomCourses,
  getAdditionalCourses,
  HistoryData,
  Meta,
  Options,
  RootState,
} from '../state';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { updateTimetable, recommendTimetable } from '../timetable/updateTimetable';
import { setTimetable, addCourse, undoTimetable, redoTimetable } from '../actions';
import { WithDispatch } from '../typeHelpers';
import { CATEGORY } from '../analytics';


const styles = (theme: Theme) => createStyles({
  spaceAbove: {
    paddingTop: theme.spacing(4),
  },
});

export interface OwnProps extends WithStyles<typeof styles> {}

export interface StateProps {
  courses: CourseMap,
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: AdditionalEvent[],
  options: Options,
  colours: ColourMap,
  webStreams: CourseId[],
  timetableData: SessionManagerData,
  timetableHistory: HistoryData,
  suggestionScore: number | null,
  meta: Meta,
  darkMode: boolean,
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  timetable: SessionManager,
  showCreateCustom: boolean,
  isUpdating: boolean,
}

class TimetableContainer extends PureComponent<Props> {
  state: State = {
    timetable: new SessionManager(),
    showCreateCustom: false,
    isUpdating: false,
  }

  render () {
    const classes = this.props.classes;

    return (
      <div className={classes.spaceAbove}>
        <TimetableControls
          history={this.props.timetableHistory}
          timetableIsEmpty={this.props.timetableData.order.length === 0}
          onUndo={this.handleUndo}
          onRedo={this.handleRedo}
          onUpdate={this.handleUpdate}
          onCreateCustom={this.handleClickCreateCustom}
          improvementScore={this.suggestionImprovementScore}
          isUpdating={this.state.isUpdating}
        />

        <CreateCustom
          open={this.state.showCreateCustom}
          onSave={this.addCustom}
          onClose={this.handleCloseCreateCustom}
        />

        <TimetableTable
          options={this.props.options}
          colours={this.props.colours}
          darkMode={this.props.darkMode}
          timetable={this.state.timetable}
          isUpdating={this.state.isUpdating}
        />
      </div>
    );
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    // Update session manager if timetable data has been updated
    let timetable = state.timetable;
    if (props.timetableData.version > timetable.version) {
      const { timetableData, courses } = props;

      try {
        // TODO: is this going to be too slow?
        timetable = SessionManager.from(timetableData, courses);

        return {
          ...state,
          timetable,
        };
      } catch (error) {
        console.error('An error occurred while generating timetable');
        console.error(error);
      }
    }

    return state;
  }

  componentDidUpdate () {
    if (!this.state.timetable.callback) {
      const timetable = new SessionManager(this.state.timetable);
      timetable.callback = data => this.handleTimetableCallback(data);
      this.setState({ timetable });
    }
  }

  private handleUndo = () => {
    this.props.dispatch(undoTimetable());
  }

  private handleRedo = () => {
    this.props.dispatch(redoTimetable());
  }

  private handleUpdate = async () => {
    const { chosen, additional, custom, events, options, webStreams, meta } = this.props;

    ReactGA.event({
      category: CATEGORY,
      action: 'Update Timetable',
    });

    this.setState({ isUpdating: true });
    try {
      await updateTimetable({
        dispatch: this.props.dispatch,
        sessionManager: new SessionManager(this.state.timetable),
        selection: { chosen, additional, custom, events, options, webStreams, meta },
        cleanUpdate: true,
        searchConfig: {
          timeout: 1000,
          maxIterations: 100000,
        },
      });
    } finally {
      this.setState({ isUpdating: false });
    }
  }

  private handleClickCreateCustom = () => {
    this.setState({
      showCreateCustom: true,
    });
  }

  private handleCloseCreateCustom = () => {
    this.setState({
      showCreateCustom: false,
    });
  }

  private addCustom = async (courseData: Omit<CourseData, 'code'>) => {
    const sessionManager = this.getSessionManager();

    let course: CourseData = {
      code: 'custom_' + Math.random(),
      isCustom: true,
      ...courseData,
    };
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable(sessionManager);
  }

  private getSessionManager = () => {
    return SessionManager.from(this.props.timetableData, this.props.courses);
  }

  private updateTimetable = async (sessionManager: SessionManager) => {
    const { chosen, additional, custom, events, options, webStreams, meta } = this.props;
    await updateTimetable({
      dispatch: this.props.dispatch,
      sessionManager,
      selection: { chosen, additional, custom, events, options, webStreams, meta },
      searchConfig: {
        timeout: 100,
      },
    });
  }

  private recommendTimetable = async () => {
    const { chosen, additional, custom, events, options, webStreams, meta } = this.props;
    recommendTimetable(
      this.props.dispatch,
      { chosen, additional, custom, events, options, webStreams, meta },
    );
  }

  private get suggestionImprovementScore () {
    const { suggestionScore } = this.props;
    if (suggestionScore !== null) {
      return suggestionScore - this.state.timetable.score;
    }

    return 0;
  }

  private async handleTimetableCallback (timetable: SessionManagerData) {
    await this.props.dispatch(setTimetable(timetable, this.props.meta));
    this.recommendTimetable();
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    courses: state.courses,
    chosen: getChosenCourses(state),
    custom: getCustomCourses(state),
    additional: getAdditionalCourses(state),
    events: state.events,
    options: state.options,
    colours: state.colours,
    webStreams: state.webStreams,
    timetableData: getCurrentTimetable(state),
    timetableHistory: state.history,
    suggestionScore: state.suggestionScore,
    meta: state.meta,
    darkMode: state.darkMode,
  };
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
