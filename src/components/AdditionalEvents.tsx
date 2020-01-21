import React from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { FormControlLabel, Checkbox, Grid } from '@material-ui/core';
import { CourseData } from '../state/Course';
import { AdditionalEvent } from '../state';

const styles = (theme: Theme) => createStyles({
  lessSpaceAbove: {
    marginTop: -theme.spacing(0.75),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
});

export interface Props extends WithStyles<typeof styles> {
  course: CourseData,
  events: AdditionalEvent[],
  onToggleEvent: (event: AdditionalEvent) => void,
}

export const AdditionalEvents = ({
  course,
  events,
  onToggleEvent,
  classes,
}: Props) => {
  const components = course.streams.map(s => s.component);
  const eventList = components.filter((c, i) => components.indexOf(c) === i);
  const eventCount = eventList.length;

  return (
    <Grid container spacing={0}>
      {eventList.map(eventName => (
        <Grid
          item
          xs={12}
          sm={6}
          md={eventCount === 4 ? 3 : 4}
          key={eventName}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={events.includes(eventName)}
                onChange={() => onToggleEvent(eventName)}
                value={eventName}
                data-cy={`event-${eventName}`}
              />
            }
            className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
            label={eventName}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default withStyles(styles)(AdditionalEvents);
