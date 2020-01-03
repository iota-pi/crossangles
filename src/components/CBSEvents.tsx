import React, { PureComponent } from 'react';
import { CBSEvent } from '../state';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { FormControlLabel, Checkbox, Grid } from '@material-ui/core';
import { CourseData } from '../state/Course';

const styles = (theme: Theme) => createStyles({
  root: {
  },
  lessSpaceAbove: {
    marginTop: -theme.spacing(0.75),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
});

export interface Props extends WithStyles<typeof styles> {
  cbs: CourseData,
  events: CBSEvent[],
  onToggleEvent: (event: CBSEvent) => void,
}

class CBSEvents extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;
    const eventList = this.getEventList();

    return (
      <Grid container spacing={0}>
        {eventList.map(eventName => (
          <Grid item xs={12} sm={6} md={3} key={eventName}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.props.events.includes(eventName)}
                  onChange={() => this.props.onToggleEvent(eventName)}
                  value={eventName}
                  data-cy={`cbs-event-${eventName}`}
                />
              }
              className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
              label={eventName}
            />
          </Grid>
        ))}
      </Grid>
    )
  }

  getEventList (): CBSEvent[] {
    const components = this.props.cbs.streams.map(s => s.component);
    const events = components.filter((c, i) => components.indexOf(c) === i);
    return events;
  }
}

export default withStyles(styles)(CBSEvents);
