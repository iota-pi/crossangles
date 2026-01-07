import React from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { TimetablePosition, Placement } from './timetableTypes';
import { Options, LinkedSession } from '../../state';
import { useCache } from '../../hooks';
import SessionDetails from './SessionDetails';

const useStyles = makeStyles(theme => ({
  main: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
    cursor: 'grab',
    overflow: 'hidden',

    transition: theme.transitions.create(['box-shadow', 'transform', 'height']),
    boxShadow: theme.shadows[3],

    '&$snapped:not($hovering)': {
      boxShadow: theme.shadows[0],
    },

    '&$dragging': {
      cursor: 'grabbing',
      transition: theme.transitions.create(['box-shadow', 'height']),
      boxShadow: theme.shadows[8],
    },
  },
  disableTransitions: {
    transition: 'none !important',
  },
  background: {
    transition: theme.transitions.create(['background-color', 'height']),
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  dragging: {},
  snapped: {},
  hovering: {},
}));

export interface Props {
  session: LinkedSession,
  colour: string | undefined,
  position: Required<Placement>,
  isDragging: boolean,
  isSnapped: boolean,
  clashDepth: number,
  options: Options,
  onDrag?: (session: LinkedSession) => false | void,
  onMove?: (session: LinkedSession, delta: TimetablePosition) => void,
  onDrop?: (session: LinkedSession) => void,
}


const Session: React.FC<Props> = ({
  colour: propColour,
  clashDepth,
  isDragging,
  isSnapped,
  onDrag,
  onMove,
  onDrop,
  options,
  position,
  session,
}: Props) => {
  const classes = useStyles();
  const rootClasses = [
    classes.main,
    isDragging ? classes.dragging : '',
    isSnapped ? classes.snapped : '',
    clashDepth > 0 ? classes.hovering : '',
    options.reducedMotion ? classes.disableTransitions : '',
  ].join(' ');
  const colour = useCache(propColour);

  const styles: CSSProperties = React.useMemo(
    () => {
      const { x, y, z, width, height } = position;

      return {
        transform: `translate(${x}px, ${y}px)`,
        width,
        height,
        zIndex: z,
      };
    },
    [position],
  );

  const backgroundStyle = React.useMemo(
    () => ({ backgroundColor: colour }),
    [colour],
  );

  const handleStart = React.useCallback(
    () => {
      if (onDrag) {
        onDrag(session);
      }
    },
    [onDrag, session],
  );
  const handleDrag = React.useCallback(
    (e: DraggableEvent, data: DraggableData) => {
      if (isDragging && onMove) {
        const x = data.deltaX;
        const y = data.deltaY;
        onMove(session, { x, y });
      }
    },
    [isDragging, onMove, session],
  );
  const handleStop = React.useCallback(
    () => {
      if (onDrop) {
        onDrop(session);
      }
    },
    [onDrop, session],
  );

  return (
    <DraggableCore
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div
        className={rootClasses}
        // TODO this cast shouldn't be necessary after updating React and MUI
        style={styles as React.CSSProperties}
        data-session
      >
        <div
          className={classes.background}
          style={backgroundStyle}
        />

        <SessionDetails
          session={session}
          options={options}
          hideDetails={!isSnapped}
        />
      </div>
    </DraggableCore>
  );
};

const TimetableSession = React.memo(Session);
export default TimetableSession;
