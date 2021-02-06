import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

// Components
import { TimetableControls } from '../components/TimetableControls';
import { TimetableTable } from '../components/Timetable';
import CreateCustom from '../components/CreateCustom';

// General
import {
  AdditionalEvent,
  ColourMap,
  CourseData,
  CourseId,
  CourseMap,
  HistoryData,
  Meta,
  Options,
  RootState,
} from '../state';
import {
  getCurrentTimetable,
  getChosenCourses,
  getCustomCourses,
  getAdditionalCourses,
} from '../state/selectors';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { updateTimetable, recommendTimetable } from '../timetable/updateTimetable';
import {
  setTimetable, addCourse, undoTimetable, redoTimetable, toggleOption,
} from '../actions';
import { WithDispatch } from '../typeHelpers';
import { CATEGORY } from '../analytics';


export interface OwnProps {
  className?: string,
  isSavingImage: boolean,
  onSaveAsImage: () => void,
}

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
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  timetable: SessionManager,
  showCreateCustom: boolean,
  isUpdating: boolean,
}

class TimetableContainer extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      timetable: new SessionManager(),
      showCreateCustom: false,
      isUpdating: false,
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    // Update session manager if timetable data has been updated
    let timetable = state.timetable;
    if (props.timetableData.version > timetable.version) {
      const { timetableData, courses } = props;

      try {
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

  componentDidUpdate() {
    if (!this.state.timetable.callback) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(({ timetable }) => {
        const newTimetable = new SessionManager(timetable);
        newTimetable.callback = data => this.handleTimetableCallback(data);
        return { timetable: newTimetable };
      });
    }
  }

  private handleUndo = () => {
    this.props.dispatch(undoTimetable());
  };

  private handleRedo = () => {
    this.props.dispatch(redoTimetable());
  };

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
        selection: {
          chosen, additional, custom, events, options, webStreams, meta,
        },
        cleanUpdate: true,
        searchConfig: {
          timeout: 1500,
          maxIterations: 100000,
        },
      });
    } finally {
      this.setState({ isUpdating: false });
    }
  };

  private handleIncludeFull = async () => {
    const sessionManager = this.getSessionManager();
    await this.props.dispatch(toggleOption('includeFull'));
    await this.updateTimetable(sessionManager);
  };

  private handleClickCreateCustom = () => {
    this.setState({ showCreateCustom: true });
  };

  private handleCloseCreateCustom = () => {
    this.setState({ showCreateCustom: false });
  };

  private handleToggleTwentyFourHours = () => {
    this.props.dispatch(toggleOption('twentyFourHours'));
  };

  private addCustom = async (courseData: Omit<CourseData, 'code'>) => {
    const sessionManager = this.getSessionManager();

    const course: CourseData = {
      code: `custom_${Math.random()}`,
      isCustom: true,
      ...courseData,
    };
    await this.props.dispatch(addCourse(course));
    await this.updateTimetable(sessionManager);
  };

  private getSessionManager = () => {
    const { timetableData, courses } = this.props;
    return SessionManager.from(timetableData, courses);
  };

  private updateTimetable = async (sessionManager: SessionManager) => {
    const { chosen, additional, custom, events, options, webStreams, meta } = this.props;
    await updateTimetable({
      dispatch: this.props.dispatch,
      sessionManager,
      selection: {
        chosen, additional, custom, events, options, webStreams, meta,
      },
      searchConfig: { timeout: 100 },
    });
  };

  private recommendTimetable = async () => {
    const { chosen, additional, custom, events, options, webStreams, meta } = this.props;
    recommendTimetable(
      this.props.dispatch,
      {
        chosen, additional, custom, events, options, webStreams, meta,
      },
    );
  };

  private getSuggestionImprovementScore = () => {
    const { suggestionScore } = this.props;
    if (suggestionScore !== null) {
      return suggestionScore - this.state.timetable.score;
    }

    return 0;
  };

  private handleTimetableCallback = async (timetable: SessionManagerData) => {
    await this.props.dispatch(setTimetable(timetable, this.props.meta));
    this.recommendTimetable();
  };

  render() {
    const timetableIsEmpty = this.props.timetableData.order.length === 0;
    return (
      <div className={this.props.className}>
        <TimetableControls
          history={this.props.timetableHistory}
          improvementScore={this.getSuggestionImprovementScore()}
          isUpdating={this.state.isUpdating}
          isSavingImage={this.props.isSavingImage}
          timetableIsEmpty={timetableIsEmpty}
          onUndo={this.handleUndo}
          onRedo={this.handleRedo}
          onUpdate={this.handleUpdate}
          onIncludeFull={this.handleIncludeFull}
          onSaveAsImage={this.props.onSaveAsImage}
          onCreateCustom={this.handleClickCreateCustom}
        />

        <CreateCustom
          open={this.state.showCreateCustom}
          onSave={this.addCustom}
          onClose={this.handleCloseCreateCustom}
        />

        <TimetableTable
          options={this.props.options}
          colours={this.props.colours}
          timetable={this.state.timetable}
          isUpdating={this.state.isUpdating}
          onToggleTwentyFourHours={this.handleToggleTwentyFourHours}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
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
});

const connected = connect(mapStateToProps);
export default connected(TimetableContainer);
