import React, { PureComponent, createRef, RefObject } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles, CSSProperties } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { Stream, MappedTimetable, CourseId } from '../../state';
import TimetableSession from './TimetableSession';
import { Dimensions } from './timetableTypes';
import { notUndefined } from '../../typeHelpers';

const noSelect: CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
}

export const TIMETABLE_FIRST_CELL_WIDTH = 60;
export const TIMETABLE_CELL_HEIGHT = 50;

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'relative',
    overflowX: 'auto',
    overflowY: 'hidden',
    zIndex: 0,
    backgroundColor: theme.palette.background.paper,
  },
  grid: {
    position: 'relative',
    overflowX: 'visible',
    overflowY: 'hidden',
    ...noSelect,
  },
  row: {
    display: 'flex',
    height: TIMETABLE_CELL_HEIGHT,

    '&$header': {
      fontWeight: 500,
      fontSize: '120%',
    },

    '&>div': {
      flex: '1 1 100%',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 0,
      borderLeftWidth: 1,
      borderTopWidth: 1,
      minWidth: 120,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      '&:first-child': {
        minWidth: TIMETABLE_FIRST_CELL_WIDTH,
        flex: '0 0 60px',
      },

      '&:last-child': {
        borderRightWidth: 1,
      },
    },

    '&:last-child > div': {
      borderBottomWidth: 1,
    }
  },
  header: {},
});

export interface Props extends WithStyles<typeof styles> {
  timetable: MappedTimetable,
  streams: Stream[],
  colours: Map<CourseId, string>,
}

class TimetableTable extends PureComponent<Props> {
  timetableRef: RefObject<HTMLDivElement>;

  constructor (props: Props) {
    super(props);
    this.timetableRef = createRef();
  }

  render() {
    const classes = this.props.classes;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
      <div className={classes.root} ref={this.timetableRef}>
        {this.props.timetable.map(s => (
          <TimetableSession
            key={`${s.course.id}-${s.stream.id}-${s.day}${s.start}-${s.end}`}
            session={s}
            timetableDimensions={this.timetableDimensions}
            firstHour={this.hours.start}
            color={notUndefined(this.props.colours.get(s.course.id))}
          />
        ))}

        <div className={classes.grid}>
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

  private get hours () {
    let start = 11;
    let end = 6;

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
        w: el.scrollWidth,
        h: el.scrollHeight,
      }
    } else {
      return { w: 0, h: 0 }
    }
  }
}

export default withStyles(styles)(TimetableTable);
