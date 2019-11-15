import React, { PureComponent } from 'react';
import { CBSEvent, CBSEventList } from '../state';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { FormControlLabel, Checkbox, Grid } from '@material-ui/core';

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
  events: CBSEvent[],
  onToggleEvent: (event: CBSEvent) => void,
}

class CBSEvents extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <Grid container spacing={0}>
        {CBSEventList.map(eventName => (
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
}

export default withStyles(styles)(CBSEvents);
