import React, { PureComponent } from 'react';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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
        label="Choose online-only lecture stream"
        className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
        control={
          <Checkbox
            checked={this.props.checked}
            onChange={this.props.onChange}
            value={true}
          />
        }
        data-cy="web-stream-toggle"
      />
    )
  }
}

export default withStyles(styles)(WebStream);
