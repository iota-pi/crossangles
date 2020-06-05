import React, { PureComponent, createRef, RefObject } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import ReactGA from 'react-ga';

import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import TimetableGrid from './TimetableGrid';
import TimetableSession from './TimetableSession';
import TimetableDropzone from './TimetableDropzone';
import { SNAP_DIST } from './timetableUtil';
import { Dimensions, Position } from './timetableTypes';
import { DropzonePlacement } from './DropzonePlacement';
import { SessionManager } from './SessionManager';
import {
  ColourMap,
  FALLBACK_COLOUR,
  getColour,
  Options,
  getCourseId,
  CourseData,
  LinkedSession,
  linkStream,
} from '../../state';
import getHours, { HourSpan } from './getHours';
import { CATEGORY } from '../../analytics';


const styles = (theme: Theme) => createStyles({
  root: {
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    zIndex: 0,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create('opacity'),
  },
  progress: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    height: 2,
  },
  faded: {
    opacity: 0.65,
  },
});

export interface Props extends WithStyles<typeof styles> {
  options: Options,
  colours: ColourMap,
  timetable: SessionManager,
  darkMode?: boolean,
  minimalHours?: boolean,
  isStandalone?: boolean,
  isUpdating?: boolean,
  twentyFourHours?: boolean,
  onToggleTwentyFourHours?: () => void,
}

export interface State {
  dimensions: Dimensions,
  dragging: LinkedSession | null,
}

class TimetableTable extends PureComponent<Props, State> {
  state: State = {
    dimensions: { width: 0, height: 0 },
    dragging: null,
  }

  timetableRef: RefObject<HTMLDivElement>;
  hours: HourSpan = { start: 11, end: 18 };

  constructor (props: Props) {
    super(props);
    this.timetableRef = createRef();
    this.updateHours();
  }

  render() {
    const classes = this.props.classes;
    const dimensions = this.state.dimensions;
    const startHour = this.hours.start;
    const rootClasses = [classes.root];
    const disabled = this.props.timetable.order.length === 0 && !this.props.isStandalone;
    if (disabled) {
      rootClasses.push(classes.faded);
    }

    return (
      <div
        className={rootClasses.join(' ')}
        data-cy="timetable"
        id="timetable-display"
      >
        {dimensions.width ? this.props.timetable.order.map(sid => {
          const placement = this.props.timetable.getMaybe(sid);
          if (!placement) return null;
          const session = placement.session;
          const courseId = getCourseId(session.course);
          const key = `${courseId}-${session.stream.component}-${session.index}`;

          return (
            <TimetableSession
              key={key}
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

        <Fade in={this.props.isUpdating} mountOnEnter unmountOnExit>
          <LinearProgress className={classes.progress} color="primary" />
        </Fade>

        <TimetableGrid
          timetableRef={this.timetableRef}
          hours={this.hours}
          disabled={disabled}
          twentyFourHours={this.props.twentyFourHours}
          onToggleTwentyFourHours={this.props.onToggleTwentyFourHours}
        />
      </div>
    )
  }

  componentDidUpdate () {
    // Update dimensions
    const dimensions = this.getTimetableDimensions();
    const { width, height } = this.state.dimensions;
    if (dimensions.width !== width || dimensions.height !== height) {
      this.setState({ dimensions });
    }

    this.updateHours();
  }

  componentDidMount () {
    window.addEventListener('resize', () => this.forceUpdate());
  }

  private getColour (course: CourseData): string {
    const courseId = getCourseId(course);
    const colourName = this.props.colours[courseId] || FALLBACK_COLOUR;
    return getColour(colourName, this.props.darkMode);
  }

  private handleDrag = (session: LinkedSession): void => {
    // Don't drag if something else is being dragged already
    if (this.state.dragging) return;

    ReactGA.event({
      category: CATEGORY,
      action: 'Drag Session',
      label: session.stream.id,
    });

    // Bump dragged stream, keeping the dragged session on top
    this.props.timetable.bumpStream(session.id);
    this.props.timetable.bumpSession(session.id);

    // Start drag in next tick so transitions aren't interrupted by the order changing
    this.forceUpdate(() => {
      // Update session placement with dragging state
      this.props.timetable.drag(session.id);

      this.props.timetable.updateClashDepths();

      // Mark this session as being dragged
      this.setState({
        dragging: session,
      });
    });
  }

  private handleMove = (session: LinkedSession, delta: Position) => {
    this.props.timetable.move(session.id, delta);

    this.forceUpdate();
  }

  private handleDrop = (session: LinkedSession): void => {
    if (!this.state.dragging) return;

    // Snap session to nearest dropzone
    const sessionPlacement = this.props.timetable.get(session.id);
    const dimensions = this.state.dimensions;
    const startHour = this.hours.start;
    const position = sessionPlacement.getPosition(dimensions, startHour);
    const dropzone = this.getNearestDropzone(position);
    this.props.timetable.drop(session.id, dropzone, this.getTimetableDimensions(), this.hours.start);

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

  private getCourses (timetable: SessionManager) {
    const sessions = timetable.orderSessions;
    const courses = sessions.map(s => s.course);
    return courses.filter((c, i) => courses.indexOf(c) === i);
  }

  private updateHours () {
    let sessions: LinkedSession[];

    if (this.props.minimalHours) {
      sessions = this.props.timetable.orderSessions;
    } else {
      // Consider times for all sessions in the chosen courses
      const courses = this.getCourses(this.props.timetable);
      const streams = courses.flatMap(c => c.streams.map(s => linkStream(c, s)));
      sessions = streams.flatMap(s => s.sessions);
    }

    const newHours = getHours(sessions);
    if (newHours.start !== this.hours.start || newHours.end !== this.hours.end) {
      this.hours = newHours;
    }
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
      const courseStreams = course.streams.map(s => linkStream(course, s));
      const componentStreams = courseStreams.filter(s => s.component === component);

      for (let stream of componentStreams) {
        if (stream.sessions.length <= index) {
          // Skip streams which don't have a session corresponding to this one
          continue;
        }

        const session = stream.sessions[index];
        if (!stream.full || this.props.options.includeFull) {
          dropzones.push(new DropzonePlacement(session));
        }
      }
    }

    return dropzones;
  }
}

export default withStyles(styles)(TimetableTable);
