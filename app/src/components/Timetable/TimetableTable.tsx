import React, { Component, createRef, RefObject } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles, CSSProperties } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { Dimensions, Position } from './timetableTypes';

import TimetableSession from './TimetableSession';
import TimetableDropzone from './TimetableDropzone';
import { TIMETABLE_CELL_HEIGHT, TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_BORDER_WIDTH, SNAP_DIST } from './timetableUtil';
import { DropzonePlacement } from './DropzonePlacement';
import { SessionManager } from './SessionManager';
import { ColourMap } from '../../state/Colours';
import { Options } from '../../state/Options';
import { getCourseId, CourseData } from '../../state/Course';
import { LinkedStream } from '../../state/Stream';
import { LinkedSession } from '../../state/Session';

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
  options: Options,
  streams: LinkedStream[],
  colours: ColourMap,
  timetable: SessionManager,
}

export interface State {
  dimensions: Dimensions,
  dragging: LinkedSession | null,
}

class TimetableTable extends Component<Props, State> {
  state: State = {
    dimensions: { width: 0, height: 0 },
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
    const daysToLetters: {[key: string]: string} = {
      'Monday': 'M', 'Tuesday': 'T', 'Wednesday': 'W', 'Thursday': 'H', 'Friday': 'F'
    }
    const dimensions = this.state.dimensions;
    const startHour = this.hours.start;

    return (
      <div className={classes.root} data-cy="timetable">
        {dimensions.width ? this.props.timetable.order.map(sid => {
          const placement = this.props.timetable.getMaybe(sid);
          if (!placement) return null;
          const session = placement.session;
          const courseId = getCourseId(session.course);

          return (
            <TimetableSession
              key={`${courseId}-${session.stream.component}-${session.index}`}
              session={session}
              colour={this.getColour(session.course)}
              position={placement.getPosition(dimensions, startHour)}
              dimensions={placement.basePlacement(dimensions, startHour)}
              isDragging={placement.isDragging}
              isSnapped={placement.isSnapped}
              clashDepth={placement.clashDepth}
              options={this.props.options}
              onDrag={this.handleDrag}
              onMove={this.handleMove}
              onDrop={this.handleDrop}
            />
          );
        }) : null}

        {this.dropzones.map(dropzone => (
          <TimetableDropzone
            key={dropzone.session.stream.id}
            position={dropzone.basePlacement(dimensions, startHour)}
            colour={this.getColour(dropzone.session.course)}
            session={dropzone.session}
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
                <div
                  key={day}
                  data-cy="timetable-cell"
                  data-time={`${daysToLetters[day]}${hour}`}
                >
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  shouldComponentUpdate (prevProps: Props, prevState: State) {
    // TODO: can I do anything more efficient?
    return true;
  }

  componentDidUpdate (prevProps: Props) {
    // Update dimensions
    const dimensions = this.getTimetableDimensions();
    const { width, height } = this.state.dimensions;
    if (dimensions.width !== width || dimensions.height !== height) {
      this.setState({ dimensions });
    }
  }

  componentDidMount () {
    window.addEventListener('resize', () => this.forceUpdate());
  }

  private getColour (course: CourseData): string {
    const black = '#000000';
    const courseId = getCourseId(course);
    return this.props.colours[courseId] || black;
  }

  private handleDrag = (session: LinkedSession): void => {
    // Don't drag if something else is being dragged already
    if (this.state.dragging) return;

    // Update session placement with dragging state
    this.props.timetable.drag(session.id);

    this.props.timetable.updateClashDepths();

    // Mark this session as being dragged
    this.setState({
      dragging: session,
    });
  }

  private handleMove = (session: LinkedSession, delta: Position) => {
    this.props.timetable.move(session.id, delta);

    this.setState({
    });
  }

  private handleDrop = (session: LinkedSession): void => {
    if (!this.state.dragging) return;

    // Snap session to nearest dropzone
    const sessionPlacement = this.props.timetable.get(session.id);
    const dimensions = this.state.dimensions;
    const startHour = this.hours.start;
    const position = sessionPlacement.getPosition(dimensions, startHour);
    const dropzone = this.getNearestDropzone(position);
    this.props.timetable.drop(session.id, dropzone);

    // No longer dragging anything
    this.setState({
      dragging: null,
    });
  }

  private getNearestDropzone (position: Position): DropzonePlacement | null {
    let nearest: DropzonePlacement | null = null;
    let bestDistance = SNAP_DIST * SNAP_DIST;
    for (let dropzone of this.dropzones) {
      const dimensions = this.state.dimensions;
      const startHour = this.hours.start;
      const dropzonePosition = dropzone.basePlacement(dimensions, startHour);
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

    return { start, end };
  }

  private get hoursArray () {
    const duration = this.hours.end - this.hours.start;
    return new Array(duration).fill(0).map((_, i) => this.hours.start + i);
  }

  private getTimetableDimensions (): Dimensions {
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

      for (let stream of this.props.streams) {
        // Check for stream with course and component matching the dragged session's
        const courseId = getCourseId(course);
        const streamCourseId = getCourseId(stream.course);
        if (courseId === streamCourseId && stream.component === component) {
          if (stream.sessions.length > index) {
            const session = stream.sessions[index];
            if (!stream.full || this.props.options.includeFull) {
              dropzones.push(new DropzonePlacement(session));
            }
          }

          // TODO: can we break here?
        }
      }
    }

    return dropzones;
  }
}

export default withStyles(styles)(TimetableTable);
