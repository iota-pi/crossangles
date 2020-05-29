import React from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { TransitionGroup } from 'react-transition-group';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import Fade from '@material-ui/core/Fade';
import Collapse from '@material-ui/core/Collapse';
import { Position, Dimensions } from './timetableTypes';
import { Options, LinkedSession } from '../../state';

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

    transition: theme.transitions.create(['box-shadow', 'transform']),
    boxShadow: theme.shadows[3],

    '&$snapped:not($hovering)': {
      boxShadow: theme.shadows[0],
    },

    '&$dragging': {
      cursor: 'grabbing',
      transition: theme.transitions.create(['box-shadow']),
      boxShadow: theme.shadows[8],
    },
  },
  background: {
    transition: theme.transitions.create(['background-color']),
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

    '& > $label': {
      lineHeight: 1.25,
      fontSize: '105%',

      '& > $em': {
        fontWeight: 500,
      },
    },
  },
  label: {},
  em: {},
  details: {
    lineHeight: 1.15,
    fontSize: '82%',
  },
}));

export interface Props {
  session: LinkedSession,
  colour: string,
  dimensions: Dimensions,
  position: Required<Position>,
  isDragging: boolean,
  isSnapped: boolean,
  clashDepth: number,
  options: Options,
  onDrag: (session: LinkedSession) => false | void,
  onMove: (session: LinkedSession, delta: Position) => void,
  onDrop: (session: LinkedSession) => void,
}

type Detail = { key: string, text: string };


const TimetableSession: React.FC<Props> = props => {
  const classes = useStyles();
  const rootClasses = [
    classes.main,
    props.isDragging ? classes.dragging : '',
    props.isSnapped ? classes.snapped : '',
    props.clashDepth > 0 ? classes.hovering : '',
  ].join(' ');
  const { dimensions, options, position, session } = props;
  const { course, stream, day, start, end } = session;
  const isSpecialCourse = course.isAdditional || course.isCustom || false;
  const sessionTitle = isSpecialCourse ? stream.component : course.code;
  const sessionComponent = isSpecialCourse ? '' : stream.component;

  const details: Detail[] = React.useMemo(
    () => {
      const details: Detail[] = [];

      if (options.showLocations) {
        const location = session.location;
        if (location) {
          details.push({ key: 'location', text: location });
        }
      }

      if (options.showEnrolments) {
        const enrols = stream.enrols;
        if (enrols[1] > 0) {
          const enrolsText = enrols.join('/');
          details.push({ key: 'enrols', text: enrolsText });
        }
      }

      if (options.showWeeks) {
        const weeks = session.weeks;
        if (weeks) {
          const weeksText = 'Weeks: ' + weeks.replace(/-/g, '–').replace(/,\s*/g, ', ');
          details.push({ key: 'weeks', text: weeksText });
        }
      }

      // Compress details onto two lines if duration is less than an hour
      if (session.end - session.start <= 1 && details.length >= 3) {
        const enrolsIndex = details.findIndex(d => d.key === 'enrols');
        const enrols = details.splice(enrolsIndex, 1)[0].text;
        const shortestItem = details.slice().sort(
          (a, b) => +(a.text.length > b.text.length) - +(a.text.length < b.text.length)
        )[0];
        shortestItem.text += `; ${enrols}`;
      }

      return details;
    },
    [options, session, stream],
  );

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

  const handleStart = (e: DraggableEvent) => {
    props.onDrag(props.session);
  }
  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    if (props.isDragging) {
      let x = data.deltaX;
      let y = data.deltaY;
      props.onMove(props.session, { x, y });
    }
  }
  const handleStop = () => {
    return props.onDrop(props.session);
  }

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
        data-snapped={+props.isSnapped}
        data-dragging={+props.isDragging}
      >
        <div
          className={classes.background}
          style={{
            backgroundColor: props.colour,
          }}
          data-cy="timetable-session-background"
        />

        <div className={classes.sessionText}>
          <div className={classes.label}>
            <span className={classes.em}>{sessionTitle} </span>
            <span>{sessionComponent}</span>
          </div>

          <Fade in={props.isSnapped} appear={false}>
            <div>
              <TransitionGroup appear={false}>
                {details.map(detail => (
                  <Collapse key={detail.key}>
                    <div className={classes.details}>
                      {detail.text}
                    </div>
                  </Collapse>
                ))}
              </TransitionGroup>
            </div>
          </Fade>
        </div>
      </div>
    </DraggableCore>
  );
}

export default TimetableSession;
