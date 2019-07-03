import React, { Component, createRef, RefObject } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles, CSSProperties } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { Stream, MappedTimetable, CourseId, MappedSession, Session } from '../../state';
import { Dimensions, Placement, Position } from './timetableTypes';
import { notUndefined } from '../../typeHelpers';

import TimetableSession from './TimetableSession';
import TimetableDropzone, { Dropzone } from './TimetableDropzone';

const noSelect: CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
}

export const TIMETABLE_FIRST_CELL_WIDTH = 60;
export const TIMETABLE_CELL_HEIGHT = 50;
export const SNAP_DIST = 40;

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    zIndex: 0,
    backgroundColor: theme.palette.background.paper,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  grid: {
    position: 'relative',
    overflowX: 'visible',
    overflowY: 'hidden',
    ...noSelect,
  },
  row: {
    display: 'flex',
    height: TIMETABLE_CELL_HEIGHT,

    '&$header': {
      fontWeight: 500,
      fontSize: '120%',
    },

    '&>div': {
      flex: '1 1 100%',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 0,
      borderLeftWidth: 1,
      borderTopWidth: 1,
      minWidth: 120,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      '&:first-child': {
        minWidth: TIMETABLE_FIRST_CELL_WIDTH,
        flex: '0 0 60px',
      },

      '&:last-child': {
        borderRightWidth: 1,
      },
    },

    '&:last-child > div': {
      borderBottomWidth: 1,
    }
  },
  header: {},
});

export interface Props extends WithStyles<typeof styles> {
  timetable: MappedTimetable,
  streams: Stream[],
  colours: Map<CourseId, string>,
  onSwapStreams: (oldStream: Stream, newStream: Stream) => void,
}

export interface State {
  dragging: MappedSession | null,
}

class TimetableTable extends Component<Props, State> {
  state: State = {
    dragging: null,
  }

  timetableRef: RefObject<HTMLDivElement>;

  constructor (props: Props) {
    super(props);
    this.timetableRef = createRef();
  }

  render() {
    const classes = this.props.classes;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
      <div className={classes.root} ref={this.timetableRef}>
        <div className={classes.overlay}>
          {this.timetableDimensions.width ? this.props.timetable.map(s => (
            <TimetableSession
              key={`${s.course.id}-${s.stream.component}-${s.index}`}
              session={s}
              placement={this.sessionPlacement(s)}
              bounds={this.timetableDimensions}
              color={notUndefined(this.props.colours.get(s.course.id))}
              onDrag={this.handleDrag}
              onDrop={this.handleDrop}
            />
          )) : null}

          {this.dropzones.map(d => (
            <TimetableDropzone
              key={`${d.session.stream.id}`}
              {...d}
            />
          ))}
        </div>


        <div className={classes.grid}>
          <div className={`${classes.row} ${classes.header}`}>
            <div></div>
            {days.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {this.hoursArray.map(hour => (
            <div className={classes.row} key={hour}>
              <div>{hour}:00</div>
              {days.map(day => (
                <div key={day}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  shouldComponentUpdate (prevProps: Props, prevState: State) {
    if (this.props.timetable !== prevProps.timetable || this.state.dragging !== prevState.dragging) {
      return true;
    }

    return false;
  }

  private handleDrag = (session: MappedSession) => {
    this.setState({ dragging: session });
  }

  private handleDrop = (session: MappedSession, position: Position, onSnap: () => void) => {
    if (!this.state.dragging) return;

    // Snap session to nearest dropzone
    const basePosition = this.sessionPlacement(session);
    const absolutePosition = {
      x: basePosition.x + position.x,
      y: basePosition.y + position.y,
    }

    // Find nearest dropzone
    let nearest: Dropzone | null = null;
    let bestDistance = SNAP_DIST * SNAP_DIST;
    for (let d of this.dropzones) {
      let delta = {
        x: d.placement.x - absolutePosition.x,
        y: d.placement.y - absolutePosition.y,
      }

      let distSq = (delta.x * delta.x) + (delta.y * delta.y);
      if (distSq < bestDistance) {
        nearest = d;
        bestDistance = distSq;
      }
    }

    // Swap streams in timetable
    if (nearest) {
      onSnap();
      this.props.onSwapStreams(this.state.dragging.stream, nearest.session.stream);
    }

    // No longer dragging anything
    this.setState({ dragging: null });
  }

  private get hours () {
    let start = 11;
    let end = 18;

    for (let stream of this.props.streams) {
      for (let session of stream.sessions) {
        if (session.start < start) {
          start = Math.floor(session.start);
        }
        if (session.end > end) {
          end = Math.ceil(session.end);
        }
      }
    }

    return { start, end }
  }

  private get hoursArray () {
    return new Array(this.hours.end - this.hours.start).fill(0).map((_, i) => this.hours.start + i);
  }

  private get timetableDimensions (): Dimensions {
    const el = this.timetableRef.current;
    if (el) {
      return {
        width: el.scrollWidth,
        height: el.scrollHeight,
      }
    } else {
      return { width: 0, height: 0 }
    }
  }

  private get timetableCellWidth (): number {
    return Math.floor((this.timetableDimensions.width - TIMETABLE_FIRST_CELL_WIDTH - 7) / 5);
  }

  private sessionPlacement (session: Session | MappedSession): Placement {
    const dayIndex = ['M', 'T', 'W', 'H', 'F'].indexOf(session.day);

    return {
      // +2px for the borders of the first cell in row
      x: Math.round(TIMETABLE_FIRST_CELL_WIDTH + (this.timetableCellWidth + 1) * dayIndex) + 2,
      // +1px for top border
      y: (TIMETABLE_CELL_HEIGHT) * (1 + session.start - this.hours.start) + 1,
      width: this.timetableCellWidth,
      height: (session.end - session.start) * TIMETABLE_CELL_HEIGHT - 1,
    }
  }

  private get dropzones () {
    const dropzones: Dropzone[] = [];

    if (this.state.dragging) {
      const { course, stream: { component }, index } = this.state.dragging;
      for (let stream of this.props.streams) {
        // Check that course and component matches with dragged session
        if (stream.course === course && stream.component === component) {
          const session = stream.sessions[index];
          dropzones.push({
            session: Object.assign({}, session, { course, stream }),
            color: notUndefined(this.props.colours.get(course.id)),
            placement: this.sessionPlacement(session),
          });
        }
      }
    }

    return dropzones;
  }
}

export default withStyles(styles)(TimetableTable);
