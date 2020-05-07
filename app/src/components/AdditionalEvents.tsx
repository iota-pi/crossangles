import React from 'react';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { RootState } from '../state';
import { CourseData } from '../state/Course';
import { getEvents, AdditionalEvent } from '../state/Events';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
  },
  eventContainer: {
    margin: 0,
    flexGrow: 0,
    maxWidth: '100%',
    flexBasis: '100%',

    [theme.breakpoints.only('sm')]: {
      maxWidth: '50%',
      flexBasis: '50%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '33.333333%',
      flexBasis: '33.333333%',
    },
  },
  quarterContainer: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '25%',
      flexBasis: '25%',
    },
  },
  lessSpaceAbove: {
    marginTop: -theme.spacing(0.75),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
}));

export interface Props {
  course: CourseData,
  events: AdditionalEvent[],
  onToggleEvent: (event: AdditionalEvent) => void,
}

export const AdditionalEvents = ({
  course,
  events,
  onToggleEvent,
}: Props) => {
  const classes = useStyles();
  const darkMode = useSelector((state: RootState) => state.darkMode);

  const eventList = getEvents(course);
  const eventIds = events.map(e => e.id);

  const eventContainerClasses = [classes.eventContainer];
  if (eventList.length === 4) {
    eventContainerClasses.push(classes.quarterContainer);
  }

  return (
    <div className={classes.root}>
      {eventList.map(event => (
        <div
          className={eventContainerClasses.join(' ')}
          key={event.id}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={eventIds.includes(event.id)}
                onChange={() => onToggleEvent(event)}
                color={darkMode ? 'primary' : 'secondary'}
                value={event.id}
                data-cy={`event-${event.id}`}
              />
            }
            className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
            label={event.name}
          />
        </div>
      ))}
    </div>
  );
}

export default AdditionalEvents;
