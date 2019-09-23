import React, { PureComponent, CSSProperties } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { DROPZONE_Z } from './timetableUtil';
import { Placement } from './timetableTypes';

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

export interface Props extends WithStyles<typeof styles> {
  position: Placement,
  colour: string,
}

class TimetableDropzone extends PureComponent<Props> {
  render() {
    const { classes, colour } = this.props;

    return (
      <div className={classes.root} style={this.styles}>
        <div
          className={classes.background}
          style={{
            backgroundColor: colour + 'A0',
          }}
        />
      </div>
    )
  }

  private get styles (): CSSProperties {
    const { width, height, x, y } = this.props.position;

    return {
      left: x,
      top: y,
      width,
      height,
    };
  }
}

export default withStyles(styles)(TimetableDropzone);
