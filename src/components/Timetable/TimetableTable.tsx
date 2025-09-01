import React, { useEffect } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { event } from 'react-ga';

import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import { TransitionGroup } from 'react-transition-group';
import TimetableGrid from './TimetableGrid';
import TimetableSession from './TimetableSession';
import TimetableDropzone from './TimetableDropzone';
import { DROPZONE_Z, getSnapDistance, getTimetableHeight } from './timetableUtil';
import { Dimensions, Placement, TimetablePosition } from './timetableTypes';
import { DropzonePlacement } from './DropzonePlacement';
import SessionManager from './SessionManager';
import SessionPlacement from './SessionPlacement';
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
  isUpdating?: boolean,
  onToggleTwentyFourHours?: () => void,
}

export interface State {
  dimensions: Dimensions,
  dragging: LinkedSession | null,
}

interface SessionRenderData {
  course: CourseData;
  id: string;
  key: string;
  position: Required<Placement>;
  session: LinkedSession;
  isDragging: boolean;
  isSnapped: boolean;
  clashDepth: number;
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

export function getDimensions(duration: number, options: Options): Dimensions | undefined {
  const timetableElement = document.getElementById(timetableGridId);
  if (timetableElement === null) {
    return undefined;
  }
  return {
    width: timetableElement.scrollWidth,
    height: getTimetableHeight(duration, getOption(options, 'compactView'), getOption(options, 'showMode')),
  };
}


function TimetableTable({
  colours,
  isUpdating,
  minimalHours,
  options,
  onToggleTwentyFourHours,
  timetable,
}: Props) {
  const compact = getOption(options, 'compactView');
  const showMode = getOption(options, 'showMode');
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
      const streams = courses.flatMap(
        c => (
          c.streams
            // Ignore streams with no times (e.g. web-only) or placeholder events
            .filter(s => Array.isArray(s.times) || (!s.times.placeholderEvent))
            .map(s => linkStream(c, s)
        )
      ));
      return getHours(streams.flatMap(s => s.sessions));
    },
    [minimalHours, sessions],
  );
  const { start, end } = hours;
  const duration = end - start;

  const [dimensions, setDimensions] = React.useState<Dimensions>({ width: 0, height: 0 });
  const updateDimensions = React.useCallback(
    () => {
      const newDimensions = getDimensions(duration, options);
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
    [options, duration],
  );
  React.useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const [, setVersion] = React.useState(false);
  const forceUpdate = React.useCallback(
    () => {
      if (dimensions.width === 0) updateDimensions();
      setVersion(v => !v);
    },
    [dimensions.width, updateDimensions],
  );
  const { version } = timetable;
  useEffect(forceUpdate, [version, forceUpdate]);
  useEffect(updateDimensions, [updateDimensions]);

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
  const [highlightedZone, setHighlightedZone] = React.useState<DropzonePlacement | null>(null);


  const handleDrag = React.useCallback(
    (session: LinkedSession): void => {
      // Don't drag if something else is being dragged already
      if (dragging) return;

      const { id, stream } = session;
      event({
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

  const getNearestDropzone = React.useCallback(
    (placement: Placement): DropzonePlacement | null => {
      let nearest: DropzonePlacement | null = null;
      const snapDistance = getSnapDistance(placement.height);
      let bestDistance = snapDistance * snapDistance;
      const centreX = placement.x + placement.width / 2;
      const centreY = placement.y + placement.height / 2;
      for (const dropzone of dropzones) {
        const dropzonePosition = dropzone.getPosition(dimensions, start, compact, showMode);
        const deltaX = (dropzonePosition.x + dropzonePosition.width / 2) - centreX;
        const deltaY = (dropzonePosition.y + dropzonePosition.height / 2) - centreY;

        const distSq = (deltaX * deltaX) + (deltaY * deltaY);
        if (distSq < bestDistance) {
          nearest = dropzone;
          bestDistance = distSq;
        }
      }
      return nearest;
    },
    [compact, dropzones, dimensions, showMode, start],
  );

  const handleMove = React.useCallback(
    (session: LinkedSession, delta: TimetablePosition) => {
      timetable.move(session.id, delta);
      const sessionPlacement = timetable.get(session.id);
      const position = sessionPlacement.getPosition(dimensions, start, compact, showMode);
      const dropzone = getNearestDropzone(position);
      setHighlightedZone(dropzone);
      forceUpdate();
    },
    [compact, dimensions, forceUpdate, getNearestDropzone, showMode, start, timetable],
  );

  const handleDrop = React.useCallback(
    (session: LinkedSession): void => {
      if (!dragging) return;

      // Snap session to nearest dropzone
      const sessionPlacement = timetable.get(session.id);
      const position = sessionPlacement.getPosition(dimensions, start, compact, showMode);
      const dropzone = getNearestDropzone(position);
      timetable.drop(session.id, dropzone, dimensions, start, compact, showMode);

      setDragging(null);
      setHighlightedZone(null);
    },
    [compact, dragging, dimensions, getNearestDropzone, showMode, start, timetable],
  );


  const classes = useStyles();
  const rootClasses = [classes.root];
  const disabled = timetable.renderOrder.length === 0;
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

  const sessionRenderData: SessionRenderData[] = (() => {
    if (!dimensions.width) {
      return [];
    }

    const results: SessionRenderData[] = [];
    for (const sid of timetable.renderOrder) {
      let placement = timetable.getMaybe(sid);
      if (!placement) continue;

      let session = placement.session;
      const isStreamBeingDragged = dragging ? dragging.stream.id === session.stream.id : false;
      // Check if another session in this stream is being dragged and hovering over a dropzone
      if (!placement.isDragging && isStreamBeingDragged && highlightedZone) {
        // Move this session to its tentative location
        const tentStream = highlightedZone.session.stream;
        if (tentStream.sessions.length > session.index) {
          const tentSession = tentStream.sessions[session.index];
          const tentPlacement = new SessionPlacement(tentSession);
          if (placement.isDragging) tentPlacement.drag();
          if (placement.isRaised) tentPlacement.raise();
          if (placement.isSnapped) tentPlacement.snap();
          placement = tentPlacement;
          session = tentSession;
        }
      }

      const { clashDepth, isDragging, isSnapped } = placement;
      const { course, id, index, stream } = session;
      const position = placement.getPosition(dimensions, start, compact, showMode);
      if (placement.isDragging && isStreamBeingDragged && highlightedZone) {
        position.height = highlightedZone.getPosition(dimensions, start, compact, showMode).height;
      }
      const courseId = getCourseId(course);
      const key = `${courseId}-${stream.component}-${index}`;

      const renderData = {
        course,
        id,
        key,
        position,
        session,
        isDragging,
        isSnapped,
        clashDepth,
      };
      results.push(renderData);
    }
    return results;
  })();

  return (
    <div
      className={rootClasses.join(' ')}
      id="timetable-display"
    >
      <TransitionGroup>
        {sessionRenderData.map(
          (
            {
              course,
              id,
              key,
              position,
              session,
              isDragging,
              isSnapped,
              clashDepth,
            },
          ) => (
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
          ),
        )}
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
              colour={draggingColour}
              highlighted={highlightedZone ? highlightedZone.id === dropzone.id : false}
              position={dropzone.getPosition(dimensions, start, compact, showMode)}
              session={dropzone.session}
              options={options}
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
        showMode={showMode}
        twentyFourHours={twentyFourHours}
        disableTransitions={disableTransitions}
        onToggleTwentyFourHours={onToggleTwentyFourHours}
      />
    </div>
  );
}

export default TimetableTable;
