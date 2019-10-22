import React, { Component, createRef, RefObject } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles, CSSProperties } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { Stream, Timetable, CourseId, Session, Options, Course } from '../../state';
import { Dimensions, Position } from './timetableTypes';

import TimetableSession from './TimetableSession';
import TimetableDropzone from './TimetableDropzone';
import { sessionClashLength } from '../../timetable';
import { TIMETABLE_CELL_HEIGHT, TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_BORDER_WIDTH, SNAP_DIST, arraysEqual } from './timetableUtil';
import { SessionPlacement } from './SessionPlacement';
import { DropzonePlacement } from './DropzonePlacement';
import { DimensionManager } from './DimensionManager';
import { SessionManager } from './SessionManager';

const noSelect: CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
}

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    zIndex: 0,
    backgroundColor: theme.palette.background.paper,

    // Outside border
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: TIMETABLE_BORDER_WIDTH,
  },
  grid: {
    position: 'relative',
    overflowX: 'visible',
    ...noSelect,
  },
  row: {
    display: 'flex',
    height: TIMETABLE_CELL_HEIGHT,

    '&>div': {
      flex: '1 1 100%',
      minWidth: 120,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 0,
      borderLeftWidth: TIMETABLE_BORDER_WIDTH,
      borderTopWidth: TIMETABLE_BORDER_WIDTH,

      '&:first-child': {
        minWidth: TIMETABLE_FIRST_CELL_WIDTH,
        flex: `0 0 ${TIMETABLE_FIRST_CELL_WIDTH}px`,

        // Remove left border on first cell
        borderLeftWidth: 0,
      },
    },

    '&$header': {
      fontWeight: 500,
      fontSize: '120%',

      '&>div': {
        // Remove top border on cells in the first row
        borderTopWidth: 0,
      }
    },
  },
  header: {},
});

export interface Props extends WithStyles<typeof styles> {
  timetable: Timetable,
  timetableVersion: number,
  options: Options,
  courses: Map<CourseId, Course>,
  streams: Stream[],
  colours: Map<CourseId, string>,
  onSwapStreams: (oldStream: Stream, newStream: Stream, topSession: Session) => void,
  onBumpStream: (stream: Stream, topSession: Session) => void,
}

export interface State {
  dimensions: DimensionManager,
  sessions: SessionManager,
  dragging: Session | null,
  version: number,
}

class TimetableTable extends Component<Props, State> {
  state: State = {
    dimensions: new DimensionManager(),
    sessions: new SessionManager(),
    dragging: null,
    version: -1,
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
      <div className={classes.root}>
        {this.state.dimensions.dimensions.width ? this.state.sessions.order.map(sid => {
          const placement = this.state.sessions.getMaybe(sid);
          if (!placement) return null;

          const session = placement.session;
          // const isDragging = this.state.dragging ? this.state.dragging.stream === s.stream : false;
          return (
            <TimetableSession
              key={`${session.course.id}-${session.stream.component}-${session.index}`}
              session={session}
              colour={this.getColour(session.course.id)}
              position={placement.position}
              dimensions={placement.basePlacement}
              isDragging={placement.isDragging}
              isSnapped={placement.isSnapped}
              clashDepth={placement.clashDepth}
              onDrag={this.handleDrag}
              onMove={this.handleMove}
              onDrop={this.handleDrop}
            />
          );
        }) : null}

        {this.dropzones.map(dropzone => (
          <TimetableDropzone
            key={dropzone.session.stream.id}
            position={dropzone.basePlacement}
            colour={this.getColour(dropzone.session.course.id)}
          />
        ))}


        <div className={classes.grid} ref={this.timetableRef}>
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
    if (this.props.timetable !== prevProps.timetable || this.props.timetableVersion !== prevProps.timetableVersion) {
      return true;
    }

    if (this.state.dragging !== prevState.dragging) {
      return true;
    }

    if (this.state.version !== prevState.version) {
      return true;
    }

    return false;
  }

  componentWillUpdate (nextProps: Props, nextState: State) {
    // Add SessionPlacement for each new session in the timetable
    const sessions = nextState.sessions;
    const timetable = nextProps.timetable;
    const includeFull = nextProps.options.includeFull;
    for (let session of timetable) {
      // Add new session placements
      if (!sessions.has(session.id)) {
        const dimensions = nextState.dimensions;
        const newPlacement = new SessionPlacement({ session, dimensions });
        sessions.set(session.id, newPlacement);
      }

      const existingPlacement = sessions.getMaybe(session.id); //TODO: could just be `get()`?
      if (existingPlacement) {
        // Displace session if it needs to be
        if (existingPlacement.shouldDisplace(includeFull)) {
          existingPlacement.displace();
        }

        // Snap session if it's been updated
        if (this.props.timetableVersion !== nextProps.timetableVersion) {
          existingPlacement.snap();
        }
      }
    }

    // Update clash depths
    if (this.timetableHasChanged(nextProps.timetable, false)) {
      this.updateClashDepths(timetable, sessions);
    }

    // Update dimensions
    const newDimensions = nextState.dimensions;
    newDimensions.updateDimensions(this.timetableDimensions);
    newDimensions.updateHours(this.hours);
  }

  componentDidMount () {
    window.addEventListener('resize', () => this.forceUpdate())
  }

  private getColour (courseId: CourseId): string {
    const black = '#000000';
    return this.props.colours.get(courseId) || black;
  }

  private timetableHasChanged (nextTimetable: Timetable, sort?: boolean): boolean {
    let oldSessionIds = this.props.timetable.map(s => s.id);
    let newSessionIds = nextTimetable.map(s => s.id);

    if (sort !== false) {
      oldSessionIds = oldSessionIds.slice().sort();
      newSessionIds = newSessionIds.slice().sort();
    }

    return !arraysEqual(oldSessionIds, newSessionIds);
  }

  private handleDrag = (session: Session): void => {
    // Don't drag if something else is being dragged already
    if (this.state.dragging) return;

    // Update session placement with dragging state
    this.state.sessions.drag(session.id);

    // Bump this session to the top of the session stack
    // this.props.onBumpStream(session.stream, session);
    this.state.sessions.bumpStream(session.id);

    // Mark this session as being dragged
    this.setState({
      dragging: session,
      version: this.state.sessions.version
    });

    this.updateClashDepths(this.props.timetable, this.state.sessions);
  }

  private handleDrop = (session: Session): void => {
    if (!this.state.dragging) return;

    // Snap session to nearest dropzone
    const droppedSession = this.state.sessions.get(session.id);
    droppedSession.drop();
    const dropzone = this.getNearestDropzone(droppedSession.position);

    // Swap streams in timetable
    if (dropzone) {
      const oldSessionId = this.state.dragging.id;
      const newSession = dropzone.session;
      const newStream = newSession.stream.sessions;

      // Add new session placements
      for (let linkedSession of newStream) {
        const id = Session.getId(linkedSession);
        if (!this.state.sessions.has(id)) {
          const dimensions = this.state.dimensions;
          const newPlacement = new SessionPlacement({
            session: Session.from(linkedSession, this.props.courses),
            dimensions
          });
          this.state.sessions.set(id, newPlacement);
        }
      }

      this.state.sessions.swapStream(oldSessionId, newSession.id);

      // Explicitly snap the new session to the dropzone
      this.state.sessions.snap(newSession.id);
    }

    // No longer dragging anything
    this.setState({
      dragging: null,
      version: this.state.sessions.version,
    });

    this.updateClashDepths(this.props.timetable, this.state.sessions);
  }

  private getNearestDropzone (position: Position): DropzonePlacement | null {
    let nearest: DropzonePlacement | null = null;
    let bestDistance = SNAP_DIST * SNAP_DIST;
    for (let dropzone of this.dropzones) {
      const dropzonePosition = dropzone.basePlacement;
      const deltaX = dropzonePosition.x - position.x;
      const deltaY = dropzonePosition.y - position.y;

      let distSq = (deltaX * deltaX) + (deltaY * deltaY);
      if (distSq < bestDistance) {
        nearest = dropzone;
        bestDistance = distSq;
      }
    }

    return nearest;
  }

  private snapStream (oldStream: Stream, newStream: Stream) {
    const draggingSession = this.state.dragging;
    if (!draggingSession) {
      return;
    }

    // Toggle snapToggle for each new session
    const newSessions = newStream.sessions;
    for (const linkedSession of newSessions) {
      const sessionId = Session.getId(linkedSession);
      const sessions = this.state.sessions;
      if (sessions.has(sessionId)) {
        sessions.snap(sessionId);
      }
    }

    // Swap streams in timetable
    this.props.onSwapStreams(oldStream, newStream, draggingSession);

    this.updateClashDepths(this.props.timetable, this.state.sessions);
  }

  private handleMove = (session: Session, delta: Position) => {
    this.state.sessions.move(session.id, delta);

    this.setState({
      version: this.state.sessions.version,
    });
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

  private get dropzones () {
    const dropzones: DropzonePlacement[] = [];

    if (this.state.dragging) {
      const { course, stream: { component }, index } = this.state.dragging;
      const dimensions = this.state.dimensions;
      const courses = this.props.courses;

      for (let stream of this.props.streams) {
        // Check for stream with course and component matching the dragged session's
        if (stream.course === course && stream.component === component) {
          if (stream.sessions.length > index) {
            const session = Session.from(stream.sessions[index], courses);
            if (!stream.full || this.props.options.includeFull) {
              dropzones.push(
                new DropzonePlacement({ session, dimensions })
              );
            }
          }

          // TODO: can we break here?
        }
      }
    }

    return dropzones;
  }

  private updateClashDepths (timetable: Timetable, sessions: SessionManager) {

    for (let i = 0; i < timetable.length; ++i) {
      let takenDepths = new Set<number>();
      const session1 = timetable[i];
      const placement1 = sessions.get(session1.id);

      // Skip sessions that aren't snapped
      if (placement1.isSnapped) {
        for (let j = 0; j < i; ++j) {
          const session2 = timetable[j];
          const placement2 = sessions.get(session2.id);

          // Skip sessions that aren't snapped
          if (!placement2.isSnapped) continue;

          // Check if sessions clash
          if (sessionClashLength(session1, session2) > 0) {
            const jDepth = placement2.clashDepth;
            takenDepths.add(jDepth);
          }
        }
      }

      for (let j = 0; j <= takenDepths.size; ++j) {
        if (!takenDepths.has(j)) {
          placement1.clashDepth = j;
          break;
        }
      }
    }
  }
}

export default withStyles(styles)(TimetableTable);
