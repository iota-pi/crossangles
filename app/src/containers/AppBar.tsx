import React, { PureComponent } from 'react';
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const styles = (theme: Theme) => {
  return createStyles({
    grow: {
      flexGrow: 1,
    },
  });
};

export interface Props extends WithStyles<typeof styles> {
};

class CrossAnglesAppBar extends PureComponent<Props> {
  render() {
    const { classes } = this.props;
    return (
      <AppBar
        position="absolute"
      >
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            CrossAngles
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }
};

export default withStyles(styles)(CrossAnglesAppBar);
