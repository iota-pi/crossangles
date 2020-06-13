import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { DROPZONE_Z } from './timetableUtil';
import { Placement } from './timetableTypes';
import { LinkedSession, SessionData } from '../../state';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: DROPZONE_Z,
  },
  background: {
    transition: theme.transitions.create('background-color'),
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
}));

export interface Props {
  position: Placement,
  session: LinkedSession | SessionData,
  colour?: string,
}

export const TimetableDropzone: React.FC<Props> = ({ colour, session, position }) => {
  const classes = useStyles();
  const styles = React.useMemo(
    () => {
      const { width, height, x, y } = position;

      return {
        left: x,
        top: y,
        width,
        height,
      };
    },
    [position],
  );
  const backgroundColor = colour ? colour + 'A0' : 'none';

  return (
    <div
      className={classes.root}
      style={styles}
      data-cy={`timetable-dropzone-${session.day}${session.start}`}
    >
      <div
        className={classes.background}
        style={{
          backgroundColor,
        }}
      />
    </div>
  );
}

export default TimetableDropzone;
