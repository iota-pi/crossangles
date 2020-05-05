import React, { PureComponent } from 'react';
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { AboutCrossAngles } from '../components/AboutCrossAngles';
import InvertColors from '@material-ui/icons/InvertColors';
import InvertColorsOff from '@material-ui/icons/InvertColorsOff';

const styles = () => {
  return createStyles({
    grow: {
      flexGrow: 1,
    },
  });
};

export interface Props extends WithStyles<typeof styles> {
  darkMode: boolean,
  onShowContact: () => void,
  onToggleDarkMode: (darkMode?: boolean) => void,
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

          <IconButton onClick={() => this.props.onToggleDarkMode()} color="inherit">
            {this.props.darkMode ? (
              <InvertColorsOff />
            ) : (
              <InvertColors />
            )}
          </IconButton>
          <AboutCrossAngles onShowContact={this.props.onShowContact} />
        </Toolbar>
      </AppBar>
    );
  }
};

export default withStyles(styles)(CrossAnglesAppBar);
