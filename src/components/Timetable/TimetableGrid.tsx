import React from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import IconButton from '@material-ui/core/IconButton';
import Schedule from '@material-ui/icons/Schedule';
import {
  getCellHeight,
  TIMETABLE_BORDER_WIDTH,
  TIMETABLE_FIRST_CELL_WIDTH,
  TIMETABLE_CELL_MIN_WIDTH,
} from './timetableUtil';

const noSelect: CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

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
      minWidth: TIMETABLE_FIRST_CELL_WIDTH + TIMETABLE_CELL_MIN_WIDTH * 5 + TIMETABLE_BORDER_WIDTH,
      zIndex: -1,
    },
    row: {
      display: 'flex',
      height: getCellHeight(false, false),
      transition: theme.transitions.create('height'),

      borderStyle: 'solid',
      borderColor: STANDARD_BORDER,
      borderWidth: 0,
      borderBottomWidth: TIMETABLE_BORDER_WIDTH,
      '&:last-child': {
        borderBottomColor: DARKER_BORDER,
      },
      '&$compact': {
        height: getCellHeight(true, false),
      },
      '&$spacious': {
        height: getCellHeight(false, true),
      },
      '&$disableTransitions': {
        transition: 'none',
      },
    },
    compact: {},
    spacious: {},
    disableTransitions: {},
    header: {
      fontWeight: 500,
      fontSize: '120%',
      borderBottomColor: DARKER_BORDER,
    },
    cell: {
      flex: '1 1 100%',
      minWidth: TIMETABLE_CELL_MIN_WIDTH,

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
const daysToLetters: { [key: string]: string } = {
  Monday: 'M',
  Tuesday: 'T',
  Wednesday: 'W',
  Thursday: 'H',
  Friday: 'F',
};

export interface Props {
  disabled: boolean,
  timetableGridId: string,
  start: number,
  end: number,
  compact: boolean,
  showMode: boolean,
  twentyFourHours: boolean,
  disableTransitions: boolean,
  onToggleTwentyFourHours?: () => void,
}

export function timeToString(hour: number, twentyFourHours: boolean) {
  let hourString = hour.toString();
  let suffix = '';
  if (twentyFourHours) {
    hourString = hourString.padStart(2, '0');
    suffix = ':00';
  } else {
    const hour12 = (hour % 12) || 12;
    hourString = hour12.toString();
    suffix = hour < 12 ? 'am' : 'pm';
  }
  return [hourString, suffix];
}

const Grid: React.FC<Props> = ({
  disabled,
  timetableGridId,
  start,
  end,
  compact,
  showMode,
  twentyFourHours,
  disableTransitions,
  onToggleTwentyFourHours,
}: Props) => {
  const classes = useStyles();
  const hoursArray = React.useMemo(
    () => {
      const duration = end - start;
      return new Array(duration).fill(0).map((_, i) => {
        const hour = start + i;
        return timeToString(hour, twentyFourHours);
      });
    },
    [start, end, twentyFourHours],
  );

  const rowClassList = [classes.row];
  if (showMode) {
    rowClassList.push(classes.spacious);
  } else if (compact) {
    rowClassList.push(classes.compact);
  }
  if (disableTransitions) {
    rowClassList.push(classes.disableTransitions);
  }
  const rowClasses = rowClassList.join(' ');

  return (
    <div id={timetableGridId} className={classes.grid}>
      <div className={`${classes.row} ${classes.compact} ${classes.header}`}>
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
        <div className={rowClasses} key={hour + am.toString()}>
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
              data-time={`${daysToLetters[day]}${hour}`}
              className={classes.cell}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const TimetableGrid = React.memo(Grid);
export default TimetableGrid;
