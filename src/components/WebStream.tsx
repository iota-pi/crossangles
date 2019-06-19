import React, { PureComponent } from 'react';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { FormControlLabel, Checkbox } from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
  root: {
  },
  lessSpaceAbove: {
    marginTop: -theme.spacing(1),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
});

export interface Props extends WithStyles<typeof styles> {
  checked: boolean,
  onChange: () => void,
}

class WebStream extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={this.props.checked}
            onChange={this.props.onChange}
            value={true}
          />
        }
        className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
        label="Choose online-only lecture stream"
      />
    )
  }
}

export default withStyles(styles)(WebStream);
