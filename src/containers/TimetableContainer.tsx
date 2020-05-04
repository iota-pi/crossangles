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

// General
import { RootState } from '../state';
import { CourseData, CourseId, CourseMap, courseSort, customSort } from '../state/Course';
import { Options } from '../state/Options';
import { ColourMap } from '../state/Colours';
import { AdditionalEvent } from '../state/Events';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { setTimetable } from '../actions';
import { undoTimetable, redoTimetable } from '../actions/history';
import { updateTimetable, recommendTimetable } from '../timetable/updateTimetable';
import { getCurrentTimetable } from '../state/Timetable';
import { Meta } from '../state/Meta';
import { HistoryData } from '../state/StateHistory';
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
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  timetable: SessionManager,
  isUpdating: boolean,
}

class TimetableContainer extends PureComponent<Props> {
  state: State = {
    timetable: new SessionManager(),
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
          improvementScore={this.suggestionImprovementScore}
          isUpdating={this.state.isUpdating}
        />

        <TimetableTable
          options={this.props.options}
          colours={this.props.colours}
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
    chosen: state.chosen.map(cid => state.courses[cid]).sort(courseSort),
    custom: state.custom.map(c => state.courses[c]).sort(customSort),
    additional: state.additional.map(c => state.courses[c]).sort(courseSort),
    events: state.events,
    options: state.options,
    colours: state.colours,
    webStreams: state.webStreams,
    timetableData: getCurrentTimetable(state),
    timetableHistory: state.history,
    suggestionScore: state.suggestionScore,
    meta: state.meta,
  };
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
