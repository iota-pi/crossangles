import React, { PureComponent } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { StateHistory } from '../state';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Undo from '@material-ui/icons/Undo';

const styles = (theme: Theme) => createStyles({
  root: {
    // backgroundColor: theme.palette.primary.main,
    // color: theme.palette.primary.contrastText,
  },
});

export interface Props extends WithStyles<typeof styles> {
  history: StateHistory,
  onUndo?: () => void,
  onRedo?: () => void,
  onUpdate?: () => void,
}

class TimetableControls extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <Toolbar className={classes.root}>
        {this.props.onUndo && (
          <IconButton
            onClick={this.props.onUndo}
            color="primary"
            disabled={this.props.history.past.length === 0}
          >
            <Undo />
          </IconButton>
        )}
      </Toolbar>
    )
  }
}

export default withStyles(styles)(TimetableControls);
