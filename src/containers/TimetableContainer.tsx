import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RootState, CBSEvent, StateHistory } from '../state';
import { WithDispatch } from '../typeHelpers';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';

// Components
import TimetableControls from '../components/TimetableControls';
import TimetableTable from '../components/Timetable';

// General
import { CourseData, CourseId, CourseMap, getCourseId } from '../state/Course';
import { linkStream, LinkedStream } from '../state/Stream';
import { Options } from '../state/Options';
import { ColourMap } from '../state/Colours';
import SessionManager, { SessionManagerData } from '../components/Timetable/SessionManager';
import { updateTimetable, doTimetableSearch, setNotice } from '../actions';
import { ThunkDispatch } from 'redux-thunk';
import { undoTimetable, redoTimetable } from '../actions/history';


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
  events: CBSEvent[],
  options: Options,
  colours: ColourMap,
  webStreams: CourseId[],
  timetableData: SessionManagerData,
  timetableHistory: StateHistory,
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
        />

        <TimetableTable
          courses={this.props.courses}
          options={this.props.options}
          allChosenIds={this.chosenIds}
          streams={this.timetableStreams}
          colours={this.props.colours}
          webStreams={this.props.webStreams}
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
      timetable.callback = (data) => handleUpdate(data, props.dispatch);
    }

    return {
      ...state,
      timetable,
    }
  }

  private handleUndo = () => {
    this.props.dispatch(undoTimetable());
  }

  private handleRedo = () => {
    this.props.dispatch(redoTimetable());
  }

  private handleUpdate = async () => {
    const newTimetable = doTimetableSearch({
      fixedSessions: [],
      courses: this.allCourses,
      events: this.props.events,
      webStreams: this.props.webStreams,
      options: this.props.options,
    });

    if (newTimetable === null) {
      // Displace some classes and display a warning
      await this.props.dispatch(setNotice('There was a problem generating a timetable'));
    } else {
      const sessionManager = new SessionManager(this.state.timetable);
      sessionManager.clear();
      sessionManager.update(newTimetable.timetable);
      await this.props.dispatch(updateTimetable(sessionManager.data));

      if (newTimetable.unplaced.length > 0) {
        await this.props.dispatch(setNotice('Some classes have been displaced'));
      }
    }
  }

  private get allCourses (): CourseData[] {
    const { chosen, custom, additional } = this.props;

    return chosen.concat(custom, additional);
  }

  private get chosenIds (): CourseId[] {
    return this.allCourses.map(c => getCourseId(c));
  }

  private get timetableStreams (): LinkedStream[] {
    // Get all streams of chosen courses
    return this.allCourses.flatMap(c => c.streams.map(s => linkStream(c, s)));
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code);
  const customSort = (a: CourseData, b: CourseData) => +(a.name > b.name) - +(a.name < b.name);

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
  };
}

const handleUpdate = (timetable: SessionManagerData, dispatch: ThunkDispatch<{}, {}, any>) => {
  dispatch(updateTimetable(timetable));
}

const connected = connect(mapStateToProps);
export default withStyles(styles)(connected(TimetableContainer));
