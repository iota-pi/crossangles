import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RootState, AdditionalEvent } from '../state';
import { StateHistory } from '../state/StateHistory';
import { WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableControls from '../components/TimetableControls';
import TimetableTable from '../components/Timetable';

// General
import { CourseData, CourseId, CourseMap, getCourseId, courseSort, customSort } from '../state/Course';
import { linkStream, LinkedStream } from '../state/Stream';
import { Options } from '../state/Options';
import { ColourMap } from '../state/Colours';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { setTimetable } from '../actions';
import { undoTimetable, redoTimetable } from '../actions/history';
import { updateTimetable, recommendTimetable } from '../timetable/updateTimetable';


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
  timetableHistory: StateHistory,
  suggestionScore: number | null,
}

export type Props = WithDispatch<OwnProps & StateProps>;

export interface State {
  timetable: SessionManager,
}

class TimetableContainer extends PureComponent<Props> {
  state: State = {
    timetable: new SessionManager(),
  }

  render () {
    const classes = this.props.classes;

    return (
      <div className={classes.spaceAbove}>
        <TimetableControls
          history={this.props.timetableHistory}
          onUndo={this.handleUndo}
          onRedo={this.handleRedo}
          onUpdate={this.handleUpdate}
          improvementScore={this.suggestionImprovementScore}
        />

        <TimetableTable
          options={this.props.options}
          streams={this.timetableStreams}
          colours={this.props.colours}
          timetable={this.state.timetable}
        />
      </div>
    );
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    // Update session manager if timetable data has been updated
    let timetable = state.timetable;
    if (props.timetableData.version > timetable.version) {
      // TODO: is this going to be too slow?
      const { timetableData, courses } = props;
      timetable = SessionManager.from(timetableData, courses);
    }

    return {
      ...state,
      timetable,
    }
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
    const { chosen, additional, custom, events, options, webStreams } = this.props;
    updateTimetable({
      dispatch: this.props.dispatch,
      sessionManager: new SessionManager(this.state.timetable),
      selection: { chosen, additional, custom, events, options, webStreams },
      cleanUpdate: true,
    })
  }

  private recommendTimetable = async () => {
    const { chosen, additional, custom, events, options, webStreams } = this.props;
    recommendTimetable(
      this.props.dispatch,
      { chosen, additional, custom, events, options, webStreams },
    );
  }

  private get allChosenCourses (): CourseData[] {
    const { chosen, custom, additional } = this.props;

    return chosen.concat(custom, additional);
  }

  private get timetableStreams (): LinkedStream[] {
    // Get all streams of chosen courses
    return this.allChosenCourses.flatMap(c => c.streams.map(s => linkStream(c, s)));
  }

  private get suggestionImprovementScore () {
    const { suggestionScore } = this.props;
    if (suggestionScore !== null) {
      return suggestionScore - this.state.timetable.score;
    }

    return 0;
  }

  private async handleTimetableCallback (timetable: SessionManagerData) {
    await this.props.dispatch(setTimetable(timetable));
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
    timetableData: state.timetable,
    timetableHistory: state.history,
    suggestionScore: state.suggestionScore,
  };
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
