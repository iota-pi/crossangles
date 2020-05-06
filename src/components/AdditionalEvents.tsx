import React from 'react';
import { useSelector } from 'react-redux';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import { RootState } from '../state';
import { CourseData } from '../state/Course';
import { getEvents, AdditionalEvent } from '../state/Events';

const useStyles = makeStyles((theme: Theme) => ({
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
  const eventCount = eventList.length;
  const eventIds = events.map(e => e.id);

  return (
    <Grid container spacing={0}>
      {eventList.map(event => (
        <Grid
          item
          xs={12}
          sm={6}
          md={eventCount === 4 ? 3 : 4}
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
        </Grid>
      ))}
    </Grid>
  );
}

export default AdditionalEvents;
