import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import OnlineIcon from '@material-ui/icons/Laptop';
import PersonIcon from '@material-ui/icons/Person';
import { DROPZONE_Z } from './timetableUtil';
import { Placement } from './timetableTypes';
import { LinkedSession, DeliveryType } from '../../state';

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
  onlineIcon: {
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
  iconSlash: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(0.5),
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
        <div className={classes.onlineIcon}>
          {delivery !== DeliveryType.person && <OnlineIcon />}
          {delivery === DeliveryType.either || delivery === DeliveryType.mixed ? (
            <span className={classes.iconSlash}>/</span>
          ) : null}
          {delivery !== DeliveryType.online && <PersonIcon />}
        </div>
      )}
    </div>
  );
};
export const TimetableDropzone: React.FC<Props> = React.memo(Dropzone);

export default TimetableDropzone;
