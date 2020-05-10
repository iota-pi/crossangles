import React, { RefObject } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { TIMETABLE_BORDER_WIDTH, TIMETABLE_CELL_HEIGHT, TIMETABLE_FIRST_CELL_WIDTH } from './timetableUtil';
import { HourSpan } from './getHours';
import IconButton from '@material-ui/core/IconButton';
import Schedule from '@material-ui/icons/Schedule';

const noSelect: CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
}

const useStyles = makeStyles(theme => {
  const STANDARD_BORDER = theme.palette.divider;
  const DARKER_BORDER = theme.palette.action.disabled;

  return {
    grid: {
      position: 'relative',
      overflowX: 'visible',
      ...noSelect,

      // Outside border
      borderStyle: 'solid',
      borderColor: DARKER_BORDER,
      borderWidth: TIMETABLE_BORDER_WIDTH,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    row: {
      display: 'flex',
      height: TIMETABLE_CELL_HEIGHT,

      borderStyle: 'solid',
      borderColor: STANDARD_BORDER,
      borderWidth: 0,
      borderBottomWidth: TIMETABLE_BORDER_WIDTH,
      '&:last-child': {
        borderBottomColor: DARKER_BORDER,
      },
    },
    header: {
      fontWeight: 500,
      fontSize: '120%',
      borderBottomColor: DARKER_BORDER,
    },
    cell: {
      flex: '1 1 100%',
      minWidth: 120,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      borderStyle: 'solid',
      borderColor: STANDARD_BORDER,
      borderWidth: 0,
      borderRightWidth: TIMETABLE_BORDER_WIDTH,
      '&:last-child': {
        borderRightColor: DARKER_BORDER,
      },
    },
    time: {
      minWidth: TIMETABLE_FIRST_CELL_WIDTH,
      flex: `0 0 ${TIMETABLE_FIRST_CELL_WIDTH}px`,
      paddingRight: theme.spacing(1.5),
      justifyContent: 'flex-end',
      borderRightColor: DARKER_BORDER,
      '&$timeCentred': {
        justifyContent: 'center',
        paddingRight: 0,
      },
    },
    timeCentred: {},
    timeSuffix: {
      fontWeight: 300,
      marginLeft: 2,
    },
  };
});

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const daysToLetters: {[key: string]: string} = {
  'Monday': 'M', 'Tuesday': 'T', 'Wednesday': 'W', 'Thursday': 'H', 'Friday': 'F'
};

export interface Props {
  disabled: boolean,
  timetableRef: RefObject<HTMLDivElement>,
  hours: HourSpan,
  twentyFourHours?: boolean,
  onToggleTwentyFourHours?: () => void,
}

export const TimetableGrid: React.FC<Props> = ({
  disabled,
  timetableRef,
  hours,
  twentyFourHours = false,
  onToggleTwentyFourHours,
}) => {
  const classes = useStyles();
  const hoursArray = React.useMemo(
    () => {
      const duration = hours.end - hours.start;
      return new Array(duration).fill(0).map((_, i) => {
        let hour = hours.start + i;
        if (twentyFourHours) {
          return [hour.toString().padStart(2, '0'), ':00'];
        } else {
          const suffix = hour < 12 ? 'am' : 'pm';
          hour = (hour % 12) || 12;
          return [hour, suffix];
        }
      });
    },
    [hours, twentyFourHours],
  );


  return (
    <div className={classes.grid} ref={timetableRef}>
      <div className={`${classes.row} ${classes.header}`}>
        <div className={`${classes.cell} ${classes.time} ${classes.timeCentred}`}>
          {onToggleTwentyFourHours && (
            <IconButton
              onClick={onToggleTwentyFourHours}
              size="small"
              disabled={disabled}
            >
              <Schedule />
            </IconButton>
          )}
        </div>

        {days.map(day => (
          <div key={day} className={classes.cell}>{day}</div>
        ))}
      </div>

      {hoursArray.map(([hour, am]) => (
        <div className={classes.row} key={hour}>
          <div className={`${classes.cell} ${classes.time}`}>
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
              className={classes.cell}
            >
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TimetableGrid;
