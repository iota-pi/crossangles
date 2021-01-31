import React, { ReactNode } from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { TransitionGroup } from 'react-transition-group';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Fade from '@material-ui/core/Fade';
import Collapse from '@material-ui/core/Collapse';
import { TimetablePosition, Dimensions } from './timetableTypes';
import { Options, LinkedSession, getDuration, DeliveryType } from '../../state';
import { useCache } from '../../hooks';
import DeliveryModeIcon from './DeliveryModeIcon';

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
  sessionText: {
    position: 'relative',
    textAlign: 'center',
    fontWeight: 300,
    lineHeight: 1.25,
    paddingLeft: 2,
    paddingRight: 2,

    '& > $label': {
      fontSize: '105%',

      '& > $em': {
        fontWeight: 500,
      },
    },
  },
  label: {},
  em: {},
  details: {
    fontSize: '88%',

    '&$compact': {
      fontSize: '82%',
      lineHeight: 1.15,
    },
  },
  compact: {},
}));

export interface Props {
  session: LinkedSession,
  colour: string | undefined,
  dimensions: Dimensions,
  position: Required<TimetablePosition>,
  isDragging: boolean,
  isSnapped: boolean,
  clashDepth: number,
  options: Options,
  onDrag?: (session: LinkedSession) => false | void,
  onMove?: (session: LinkedSession, delta: TimetablePosition) => void,
  onDrop?: (session: LinkedSession) => void,
}

type Detail = { key: string, text: ReactNode };


const Session: React.FC<Props> = ({
  colour: propColour,
  clashDepth,
  dimensions,
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
  const { compactView, reducedMotion, showMode } = options;
  const rootClasses = [
    classes.main,
    isDragging ? classes.dragging : '',
    isSnapped ? classes.snapped : '',
    clashDepth > 0 ? classes.hovering : '',
    reducedMotion ? classes.disableTransitions : '',
  ].join(' ');
  const { course, day, start, end, stream } = session;
  const isSpecialCourse = course.isAdditional || course.isCustom || false;
  const sessionTitle = isSpecialCourse ? stream.component : course.code;
  const sessionComponent = isSpecialCourse ? '' : stream.component;


  const details: Detail[] = React.useMemo(
    () => {
      const detailList: Detail[] = [];

      if (options.showLocations && stream.delivery !== DeliveryType.online) {
        const location = session.location;
        if (location) {
          detailList.push({ key: 'location', text: location });
        }
      }

      if (options.showEnrolments && stream.enrols) {
        const enrols = stream.enrols;
        if (enrols[1] > 0) {
          const enrolsText = enrols.join('/');
          detailList.push({ key: 'enrols', text: enrolsText });
        }
      }

      if (options.showWeeks) {
        const weeks = session.weeks;
        if (weeks) {
          const weeksText = `Weeks: ${weeks.replace(/-/g, '–').replace(/,\s*/g, ', ')}`;
          detailList.push({ key: 'weeks', text: weeksText });
        }
      }

      // Compress details onto two lines if duration is less than an hour
      if (getDuration(session) <= 1 && detailList.length >= 3) {
        const enrolsIndex = detailList.findIndex(d => d.key === 'enrols');
        const enrols = detailList.splice(enrolsIndex, 1)[0].text;
        detailList[1].text += ` (${enrols})`;
      }

      return detailList;
    },
    [options, session, stream],
  );

  const colour = useCache(propColour);

  const styles: CSSProperties = React.useMemo(
    () => {
      const { width, height } = dimensions;
      const { x, y, z } = position;

      return {
        transform: `translate(${x}px, ${y}px)`,
        width,
        height,
        zIndex: z,
      };
    },
    [dimensions, position],
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

  const backgroundStyle = React.useMemo(
    () => ({ backgroundColor: colour }),
    [colour],
  );

  const detailsClassList = [classes.details];
  if (compactView && !showMode) { detailsClassList.push(classes.compact); }
  const detailsClasses = detailsClassList.join(' ');

  return (
    <DraggableCore
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
    >
      <div
        className={rootClasses}
        style={styles}
        data-cy="timetable-session"
        data-session={`${course.code}-${stream.component}-${day}${start}-${end}`}
        data-snapped={+isSnapped}
        data-dragging={+isDragging}
      >
        <div
          className={classes.background}
          style={backgroundStyle}
          data-cy="timetable-session-background"
        />

        <div className={classes.sessionText}>
          <div className={classes.label}>
            <span className={classes.em}>{sessionTitle}</span>
            {' '}
            <span>{sessionComponent}</span>
          </div>

          <Fade in={isSnapped}>
            <div>
              <TransitionGroup>
                {details.map(detail => (
                  <Collapse key={detail.key}>
                    <div className={detailsClasses}>
                      {detail.text}
                    </div>
                  </Collapse>
                ))}
                {showMode && stream.delivery !== undefined && (
                  <Collapse key="deliveryMode">
                    <DeliveryModeIcon delivery={stream.delivery} padded={getDuration(session) > 1} />
                  </Collapse>
                )}
              </TransitionGroup>
            </div>
          </Fade>
        </div>
      </div>
    </DraggableCore>
  );
};

export const TimetableSession = React.memo(Session);
export default TimetableSession;
