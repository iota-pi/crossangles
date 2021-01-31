import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import DeliveryModeIcon from './DeliveryModeIcon';
import { DROPZONE_Z } from './timetableUtil';
import { Placement } from './timetableTypes';
import { getDuration, LinkedSession } from '../../state';

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
  deliveryIcon: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
}));

export interface Props {
  colour?: string,
  position: Placement,
  session: LinkedSession,
}

const Dropzone: React.FC<Props> = ({ colour, position, session }: Props) => {
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
  const backgroundColor = colour ? `${colour}A0` : 'none';
  const delivery = session.stream.delivery;

  return (
    <div
      className={classes.root}
      style={styles}
      data-cy={`timetable-dropzone-${session.day}${session.start}`}
    >
      <div
        className={classes.background}
        style={{ backgroundColor }}
      />
      {delivery !== undefined && (
        <div className={classes.deliveryIcon}>
          <DeliveryModeIcon delivery={delivery} padded={getDuration(session) > 1} />
        </div>
      )}
    </div>
  );
};
export const TimetableDropzone: React.FC<Props> = React.memo(Dropzone);

export default TimetableDropzone;
