import React, { PureComponent, CSSProperties } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { MappedSession } from '../../state';
import { Placement } from './timetableTypes';
import { DROPZONE_Z } from './timetableConstants';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: DROPZONE_Z,
  },
  background: {
    transition: 'background-color 0.3s',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
});

export interface Dropzone {
  session: MappedSession,
  color: string,
  placement: Placement,
}

export interface Props extends WithStyles<typeof styles>, Dropzone {}

class TimetableDropzone extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <div className={classes.root} style={this.styles}>
        <div
          className={classes.background}
          style={{
            backgroundColor: this.props.color + 'A0',
          }}
        />
      </div>
    )
  }

  private get styles (): CSSProperties {
    return {
      width: this.props.placement.width,
      height: this.props.placement.height,
      left: this.props.placement.x,
      top: this.props.placement.y,
    };
  }
}

export default withStyles(styles)(TimetableDropzone);
