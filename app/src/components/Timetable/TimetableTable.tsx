import React, { useEffect } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ReactGA from 'react-ga';

import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import { TransitionGroup } from 'react-transition-group';
import TimetableGrid from './TimetableGrid';
import TimetableSession from './TimetableSession';
import TimetableDropzone from './TimetableDropzone';
import { SNAP_DIST, DROPZONE_Z } from './timetableUtil';
import { Dimensions, Position } from './timetableTypes';
import { DropzonePlacement } from './DropzonePlacement';
import { SessionManager } from './SessionManager';
import {
  ColourMap,
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
  compactView?: boolean,
  onToggleTwentyFourHours?: () => void,
}

export interface State {
  dimensions: Dimensions,
  dragging: LinkedSession | null,
}

export function getCourseColour (course: CourseData, colourMap: ColourMap, darkMode = false): string | undefined {
  const courseId = getCourseId(course);
  const colourName = colourMap[courseId];
  if (colourName) {
    return getColour(colourName, darkMode);
  } else {
    return undefined;
  }
}

function TimetableTable (props: Props) {
  const timetable = props.timetable;
  const compact = props.compactView || false;
  const sessions = React.useMemo(
    () => timetable.renderOrder.map(sid => timetable.getSession(sid)),
    [timetable],
  );
  const hours = React.useMemo(() => {
    if (props.minimalHours) {
      // Only consider times for currently placed sessions
      return getHours(sessions);
    }
    const courses = sessions.map(s => s.course).filter((c, i, arr) => arr.indexOf(c) === i);
    const streams = courses.flatMap(c => c.streams.map(s => linkStream(c, s)));
    return getHours(streams.flatMap(s => s.sessions));
  }, [props.minimalHours, sessions]);

  const timetableRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState<Dimensions>({ width: 0, height: 0 });
  const updateDimensions = React.useCallback(
    () => {
      const el = timetableRef.current;
      if (el) {
        setDimensions({
          width: el.scrollWidth,
          height: el.scrollHeight,
        });
      }
    },
    [timetableRef],
  );
  const [version, setVersion] = React.useState(false);
  React.useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [timetableRef, updateDimensions]);
  const forceUpdate = React.useCallback(
    () => {
      if (dimensions.width === 0) updateDimensions();
      setVersion(!version);
    },
    [dimensions.width, version, updateDimensions],
  );

  useEffect(forceUpdate, [timetable.version]);
  useEffect(updateDimensions, [hours]);

  const [dragging, setDragging] = React.useState<LinkedSession | null>(null);

  const [dropzones, setDropzones] = React.useState<DropzonePlacement[]>([]);
  React.useEffect(
    () => {
      if (dragging) {
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
        setDropzones(dropzones);
      }
    },
    [dragging, props.options.includeFull],
  );


  const handleDrag = React.useCallback(
    (session: LinkedSession): void => {
      // Don't drag if something else is being dragged already
      if (dragging) return;

      ReactGA.event({
        category: CATEGORY,
        action: 'Drag Session',
        label: session.stream.id,
      });

      // Bump dragged stream, keeping the dragged session on top
      timetable.bumpStream(session.id);
      timetable.bumpSession(session.id);

      timetable.drag(session.id);
      timetable.updateClashDepths();

      // Mark this session as being dragged
      setDragging(session);
    },
    [timetable, dragging, setDragging],
  );

  const handleMove = React.useCallback(
    (session: LinkedSession, delta: Position) => {
      timetable.move(session.id, delta);
      forceUpdate();
    },
    [timetable, forceUpdate],
  );

  const getNearestDropzone = React.useCallback(
    (position: Position): DropzonePlacement | null => {
      let nearest: DropzonePlacement | null = null;
      let bestDistance = SNAP_DIST * SNAP_DIST;
      for (let dropzone of dropzones) {
        const dropzonePosition = dropzone.basePlacement(dimensions, hours.start, compact);
        const deltaX = dropzonePosition.x - position.x;
        const deltaY = dropzonePosition.y - position.y;

        let distSq = (deltaX * deltaX) + (deltaY * deltaY);
        if (distSq < bestDistance) {
          nearest = dropzone;
          bestDistance = distSq;
        }
      }
      return nearest;
    },
    [dropzones, dimensions, hours.start, compact],
  );

  const handleDrop = React.useCallback(
    (session: LinkedSession): void => {
      if (!dragging) return;

      // Snap session to nearest dropzone
      const sessionPlacement = timetable.get(session.id);
      const position = sessionPlacement.getPosition(dimensions, hours.start, compact);
      const dropzone = getNearestDropzone(position);
      timetable.drop(session.id, dropzone, dimensions, hours.start, compact);

      setDragging(null);
    },
    [timetable, getNearestDropzone, dragging, dimensions, hours.start, compact],
  );


  const classes = useStyles();
  const rootClasses = [classes.root];
  const disabled = timetable.renderOrder.length === 0 && !props.isStandalone;
  if (disabled) {
    rootClasses.push(classes.faded);
  }

  const draggingColour = dragging ? getCourseColour(dragging.course, props.colours, props.darkMode) : undefined;
  const dropzoneStyles = React.useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      zIndex: dragging ? DROPZONE_Z : undefined,
    }),
    [dragging],
  );

  return (
    <div
      className={rootClasses.join(' ')}
      data-cy="timetable"
      id="timetable-display"
    >
      <TransitionGroup>
        {dimensions.width ? timetable.renderOrder.map(sid => {
          const placement = timetable.getMaybe(sid);
          if (!placement) return null;
          const session = placement.session;
          const courseId = getCourseId(session.course);
          const key = `${courseId}-${session.stream.component}-${session.index}`;
          const position = placement.getPosition(dimensions, hours.start, compact);

          return (
            <Fade
              key={key}
              appear={!props.disableTransitions}
              enter={!props.disableTransitions}
              exit={!props.disableTransitions}
            >
              <div style={{ zIndex: position.z }}>
                <TimetableSession
                  session={session}
                  colour={getCourseColour(session.course, props.colours, props.darkMode)}
                  position={position}
                  dimensions={placement.basePlacement(dimensions, hours.start, compact)}
                  isDragging={placement.isDragging}
                  isSnapped={placement.isSnapped}
                  clashDepth={placement.clashDepth}
                  options={props.options}
                  disableTransitions={props.disableTransitions}
                  onDrag={handleDrag}
                  onMove={dragging && dragging.id === session.id ? handleMove : undefined}
                  onDrop={handleDrop}
                />
              </div>
            </Fade>
          );
        }) : null}
      </TransitionGroup>

      <Fade
        in={!!dragging}
        appear={!props.disableTransitions}
        enter={!props.disableTransitions}
        exit={!props.disableTransitions}
      >
        <div style={dropzoneStyles}>
          {dropzones.map(dropzone => (
            <TimetableDropzone
              key={dropzone.session.stream.id}
              position={dropzone.basePlacement(dimensions, hours.start, compact)}
              colour={draggingColour}
              session={dropzone.session}
            />
          ))}
        </div>
      </Fade>

      <Fade in={props.isUpdating} mountOnEnter unmountOnExit>
        <LinearProgress className={classes.progress} color="primary" />
      </Fade>

      <TimetableGrid
        timetableRef={timetableRef}
        start={hours.start}
        end={hours.end}
        disabled={disabled}
        twentyFourHours={props.twentyFourHours || false}
        compact={compact}
        onToggleTwentyFourHours={props.onToggleTwentyFourHours}
      />
    </div>
  );
}

export default TimetableTable;
