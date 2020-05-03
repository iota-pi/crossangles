import React, { RefObject } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles, CSSProperties } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { TIMETABLE_BORDER_WIDTH, TIMETABLE_CELL_HEIGHT, TIMETABLE_FIRST_CELL_WIDTH } from './timetableUtil';
import { HourSpan } from './getHours';

const noSelect: CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
}

const styles = (theme: Theme) => createStyles({
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
        paddingRight: theme.spacing(1.5),
        justifyContent: 'flex-end',

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
  timeSuffix: {
    fontWeight: 300,
    marginLeft: 2,
  },
});

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const daysToLetters: {[key: string]: string} = {
  'Monday': 'M', 'Tuesday': 'T', 'Wednesday': 'W', 'Thursday': 'H', 'Friday': 'F'
};

export interface Props extends WithStyles<typeof styles> {
  timetableRef: RefObject<HTMLDivElement>,
  hours: HourSpan,
  twentyFourHours?: boolean,
}

export const TimetableGrid = withStyles(styles)(({
  classes,
  timetableRef,
  hours,
  twentyFourHours = false,
}: Props) => {
  const duration = hours.end - hours.start;
  const hoursArray = new Array(duration).fill(0).map((_, i) => {
    let hour = hours.start + i;
    if (twentyFourHours) {
      return [hour.toString().padStart(2, '0'), ':00'];
    } else {
      const suffix = hour < 12 ? 'am' : 'pm';
      hour = (hour % 12) || 12;
      return [hour, suffix];
    }
  });

  return (
    <div className={classes.grid} ref={timetableRef}>
      <div className={`${classes.row} ${classes.header}`}>
        <div></div>
        {days.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {hoursArray.map(([hour, am]) => (
        <div className={classes.row} key={hour}>
          <div>
            <span>
              {hour}
            </span>
            <span className={twentyFourHours ? undefined : classes.timeSuffix}>
              {am}
            </span>
          </div>
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
  );
});

export default TimetableGrid;
