import React, { useEffect } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
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
import getHours from './getHours';
import { CATEGORY } from '../../analytics';


const useStyles = makeStyles(theme => ({
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
}));

export interface Props {
  options: Options,
  colours: ColourMap,
  timetable: SessionManager,
  darkMode?: boolean,
  minimalHours?: boolean,
  isStandalone?: boolean,
  isUpdating?: boolean,
  disableTransitions?: boolean,
  twentyFourHours?: boolean,
  onToggleTwentyFourHours?: () => void,
}

export interface State {
  dimensions: Dimensions,
  dragging: LinkedSession | null,
}

export function getCourseColour (course: CourseData, colourMap: ColourMap, darkMode = false): string {
  const courseId = getCourseId(course);
  const colourName = colourMap[courseId] || FALLBACK_COLOUR;
  return getColour(colourName, darkMode);
}

function TimetableTable (props: Props) {
  const timetableRef = React.useRef<HTMLDivElement>(null);
  const updateDimensions = () => {
    const el = timetableRef.current;
    if (el) {
      setDimensions({
        width: el.scrollWidth,
        height: el.scrollHeight,
      });
    } else {
      setDimensions({ width: 0, height: 0 });
    }
  };
  const [dimensions, setDimensions] = React.useState<Dimensions>({ width: 0, height: 0 })
  React.useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [timetableRef]);

  const [version, setVersion] = React.useState(false);
  const forceUpdate = () => {
    if (dimensions.width === 0) updateDimensions();
    setVersion(!version);
  };

  useEffect(forceUpdate, [props.timetable.version]);


  const [dragging, setDragging] = React.useState<LinkedSession | null>(null);

  const sessions = props.timetable.orderSessions;
  const hours = React.useMemo(() => {
    if (props.minimalHours) {
      // Only consider times for currently placed sessions
      return getHours(sessions);
    }
    const courses = sessions.map(s => s.course).filter((c, i, arr) => arr.indexOf(c) === i);
    const streams = courses.flatMap(c => c.streams.map(s => linkStream(c, s)));
    return getHours(streams.flatMap(s => s.sessions));
  }, [props.minimalHours, sessions]);

  const dropzones = React.useMemo<DropzonePlacement[]>(() => {
    if (!dragging) { return []; }

    const { course, stream: { component }, index } = dragging;
    let streams = course.streams.map(s => linkStream(course, s));
    streams = streams.filter(s => {
      // Skip streams that are for a different component
      if (s.component !== component) { return false; }

      // Skip streams which don't have enough sessions
      if (index >= s.sessions.length) { return false; }

      if (s.full && !props.options.includeFull) { return false; }

      return true;
    });
    const dropzones = streams.flatMap(s => {
      const session = s.sessions[index];
      return new DropzonePlacement(session);
    });
    return dropzones;
  }, [dragging, props.options.includeFull]);


  const handleDrag = (session: LinkedSession): void => {
    // Don't drag if something else is being dragged already
    if (dragging) return;

    ReactGA.event({
      category: CATEGORY,
      action: 'Drag Session',
      label: session.stream.id,
    });

    // Bump dragged stream, keeping the dragged session on top
    props.timetable.bumpStream(session.id);
    props.timetable.bumpSession(session.id);

    // Start drag in next tick so transitions aren't interrupted by the order changing
    // forceUpdate(() => {
      // Update session placement with dragging state
      props.timetable.drag(session.id);

      props.timetable.updateClashDepths();

      // Mark this session as being dragged
      setDragging(session);
    // });
    // forceUpdate();
  }

  const handleMove = (session: LinkedSession, delta: Position) => {
    props.timetable.move(session.id, delta);
    forceUpdate();
  }

  const handleDrop = (session: LinkedSession): void => {
    if (!dragging) return;

    // Snap session to nearest dropzone
    const sessionPlacement = props.timetable.get(session.id);
    const startHour = hours.start;
    const position = sessionPlacement.getPosition(dimensions, startHour);
    const dropzone = getNearestDropzone(position);
    props.timetable.drop(session.id, dropzone, dimensions, hours.start);

    setDragging(null);
  }

  const getNearestDropzone = (position: Position): DropzonePlacement | null => {
    let nearest: DropzonePlacement | null = null;
    let bestDistance = SNAP_DIST * SNAP_DIST;
    const startHour = hours.start;
    for (let dropzone of dropzones) {
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


  const classes = useStyles();
  const rootClasses = [classes.root];
  const disabled = props.timetable.order.length === 0 && !props.isStandalone;
  if (disabled) {
    rootClasses.push(classes.faded);
  }

  return (
    <div
      className={rootClasses.join(' ')}
      data-cy="timetable"
      id="timetable-display"
    >
      {dimensions.width ? props.timetable.order.map(sid => {
        const placement = props.timetable.getMaybe(sid);
        if (!placement) return null;
        const session = placement.session;
        const courseId = getCourseId(session.course);
        const key = `${courseId}-${session.stream.component}-${session.index}`;

        return (
          <TimetableSession
            key={key}
            session={session}
            colour={getCourseColour(session.course, props.colours, props.darkMode)}
            position={placement.getPosition(dimensions, hours.start)}
            dimensions={placement.basePlacement(dimensions, hours.start)}
            isDragging={placement.isDragging}
            isSnapped={placement.isSnapped}
            clashDepth={placement.clashDepth}
            options={props.options}
            disableTransitions={props.disableTransitions}
            onDrag={handleDrag}
            onMove={handleMove}
            onDrop={handleDrop}
          />
        );
      }) : null}

      {dropzones.map(dropzone => (
        <TimetableDropzone
          key={dropzone.session.stream.id}
          position={dropzone.basePlacement(dimensions, hours.start)}
          colour={getCourseColour(dropzone.session.course, props.colours, props.darkMode)}
          session={dropzone.session}
        />
      ))}

      <Fade in={props.isUpdating} mountOnEnter unmountOnExit>
        <LinearProgress className={classes.progress} color="primary" />
      </Fade>

      <TimetableGrid
        timetableRef={timetableRef}
        start={hours.start}
        end={hours.end}
        disabled={disabled}
        twentyFourHours={props.twentyFourHours}
        onToggleTwentyFourHours={props.onToggleTwentyFourHours}
      />
    </div>
  );
}

export default TimetableTable;
