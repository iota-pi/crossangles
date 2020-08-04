import React, { useEffect } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ReactGA from 'react-ga';

import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import { TransitionGroup } from 'react-transition-group';
import { TimetableGrid } from './TimetableGrid';
import { TimetableSession } from './TimetableSession';
import { TimetableDropzone } from './TimetableDropzone';
import { SNAP_DIST, DROPZONE_Z } from './timetableUtil';
import { Dimensions, TimetablePosition } from './timetableTypes';
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
  getOption,
} from '../../state';
import { getHours } from './getHours';
import { CATEGORY } from '../../analytics';
import { getDropzones } from './dropzones';


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
  minimalHours?: boolean,
  isStandalone?: boolean,
  isUpdating?: boolean,
  onToggleTwentyFourHours?: () => void,
}

export interface State {
  dimensions: Dimensions,
  dragging: LinkedSession | null,
}

export function getCourseColour(
  course: CourseData,
  colourMap: ColourMap,
  darkMode = false,
): string | undefined {
  const courseId = getCourseId(course);
  const colourName = colourMap[courseId];
  if (colourName) {
    return getColour(colourName, darkMode);
  }
  return undefined;
}

const timetableGridId = `TimetableGrid-${Math.random()}`;

export function getDimensions(): Dimensions | undefined {
  const timetableElement = document.getElementById(timetableGridId);
  if (timetableElement === null) {
    return undefined;
  }
  return {
    width: timetableElement.scrollWidth,
    height: timetableElement.scrollHeight,
  };
}


function TimetableTable({
  colours,
  isStandalone,
  isUpdating,
  minimalHours,
  options,
  onToggleTwentyFourHours,
  timetable,
}: Props) {
  const compact = getOption(options, 'compactView');
  const darkMode = getOption(options, 'darkMode');
  const disableTransitions = getOption(options, 'reducedMotion');
  const twentyFourHours = getOption(options, 'twentyFourHours');
  const includeFull = getOption(options, 'includeFull');

  const sessions = React.useMemo(
    () => timetable.renderOrder.map(sid => timetable.getSession(sid)),
    [timetable],
  );
  const hours = React.useMemo(
    () => {
      if (minimalHours) {
        // Only consider times for currently placed sessions
        return getHours(sessions);
      }
      const courses = sessions.map(s => s.course).filter((c, i, arr) => arr.indexOf(c) === i);
      const streams = courses.flatMap(c => c.streams.map(s => linkStream(c, s)));
      return getHours(streams.flatMap(s => s.sessions));
    },
    [minimalHours, sessions],
  );
  const { start, end } = hours;

  const [dimensions, setDimensions] = React.useState<Dimensions>({ width: 0, height: 0 });
  const updateDimensions = React.useCallback(
    () => {
      const newDimensions = getDimensions();
      if (newDimensions) {
        setDimensions(oldDimensions => {
          if (
            newDimensions.width !== oldDimensions.width
            || newDimensions.height !== oldDimensions.height
          ) {
            return newDimensions;
          }
          return oldDimensions;
        });
      }
    },
    [],
  );
  const [, setVersion] = React.useState(false);
  React.useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);
  const forceUpdate = React.useCallback(
    () => {
      if (dimensions.width === 0) updateDimensions();
      setVersion(v => !v);
    },
    [dimensions.width, updateDimensions],
  );

  const { version } = timetable;
  useEffect(forceUpdate, [version, forceUpdate]);
  useEffect(updateDimensions, [hours, updateDimensions]);

  const [dragging, setDragging] = React.useState<LinkedSession | null>(null);

  const [dropzones, setDropzones] = React.useState<DropzonePlacement[]>([]);
  React.useEffect(
    () => {
      if (dragging) {
        setDropzones(
          getDropzones(dragging, includeFull),
        );
      }
    },
    [dragging, includeFull],
  );


  const handleDrag = React.useCallback(
    (session: LinkedSession): void => {
      // Don't drag if something else is being dragged already
      if (dragging) return;

      const { id, stream } = session;
      ReactGA.event({
        category: CATEGORY,
        action: 'Drag Session',
        label: stream.id,
      });

      // Bump dragged stream, keeping the dragged session on top
      timetable.bumpStream(id);
      timetable.bumpSession(id);

      timetable.drag(id);
      timetable.updateClashDepths();

      // Mark this session as being dragged
      setDragging(session);
    },
    [timetable, dragging, setDragging],
  );

  const handleMove = React.useCallback(
    (session: LinkedSession, delta: TimetablePosition) => {
      timetable.move(session.id, delta);
      forceUpdate();
    },
    [forceUpdate, timetable],
  );

  const getNearestDropzone = React.useCallback(
    (position: TimetablePosition): DropzonePlacement | null => {
      const { x, y } = position;
      let nearest: DropzonePlacement | null = null;
      let bestDistance = SNAP_DIST * SNAP_DIST;
      for (const dropzone of dropzones) {
        const dropzonePosition = dropzone.basePlacement(dimensions, start, compact);
        const deltaX = dropzonePosition.x - x;
        const deltaY = dropzonePosition.y - y;

        const distSq = (deltaX * deltaX) + (deltaY * deltaY);
        if (distSq < bestDistance) {
          nearest = dropzone;
          bestDistance = distSq;
        }
      }
      return nearest;
    },
    [compact, dropzones, dimensions, start],
  );

  const handleDrop = React.useCallback(
    (session: LinkedSession): void => {
      if (!dragging) return;

      // Snap session to nearest dropzone
      const sessionPlacement = timetable.get(session.id);
      const position = sessionPlacement.getPosition(dimensions, start, compact);
      const dropzone = getNearestDropzone(position);
      timetable.drop(session.id, dropzone, dimensions, start, compact);

      setDragging(null);
    },
    [compact, dragging, dimensions, getNearestDropzone, start, timetable],
  );


  const classes = useStyles();
  const rootClasses = [classes.root];
  const disabled = timetable.renderOrder.length === 0 && !isStandalone;
  if (disabled) {
    rootClasses.push(classes.faded);
  }

  const draggingColour = dragging ? getCourseColour(dragging.course, colours, darkMode) : undefined;
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
          const { clashDepth, isDragging, isSnapped, session } = placement;
          const { course, id, index, stream } = session;
          const position = placement.getPosition(dimensions, start, compact);
          const courseId = getCourseId(course);
          const key = `${courseId}-${stream.component}-${index}`;

          return (
            <Fade
              key={key}
              enter={!disableTransitions}
              exit={!disableTransitions}
            >
              <div style={{ zIndex: position.z }}>
                <TimetableSession
                  session={session}
                  colour={getCourseColour(course, colours, darkMode)}
                  position={position}
                  dimensions={placement.basePlacement(dimensions, start, compact)}
                  isDragging={isDragging}
                  isSnapped={isSnapped}
                  clashDepth={clashDepth}
                  options={options}
                  onDrag={handleDrag}
                  onMove={dragging && dragging.id === id ? handleMove : undefined}
                  onDrop={handleDrop}
                />
              </div>
            </Fade>
          );
        }) : null}
      </TransitionGroup>

      <Fade
        in={!!dragging}
        appear={!disableTransitions}
        enter={!disableTransitions}
        exit={!disableTransitions}
      >
        <div style={dropzoneStyles}>
          {dropzones.map(dropzone => (
            <TimetableDropzone
              key={dropzone.session.stream.id}
              position={dropzone.basePlacement(dimensions, start, compact)}
              colour={draggingColour}
              session={dropzone.session}
            />
          ))}
        </div>
      </Fade>

      <Fade in={isUpdating} mountOnEnter unmountOnExit>
        <LinearProgress className={classes.progress} color="primary" />
      </Fade>

      <TimetableGrid
        timetableGridId={timetableGridId}
        start={start}
        end={end}
        disabled={disabled}
        compact={compact}
        twentyFourHours={twentyFourHours}
        disableTransitions={disableTransitions}
        onToggleTwentyFourHours={onToggleTwentyFourHours}
      />
    </div>
  );
}

export default TimetableTable;
