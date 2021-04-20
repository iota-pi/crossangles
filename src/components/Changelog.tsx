import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';

import CloseIcon from '@material-ui/icons/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from '@material-ui/core';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab';
import changelog from '../changelog';
import { setChangelogView } from '../actions';
import { RootState } from '../state';


const useStyles = makeStyles(theme => ({
  root: {
    marginTop: '15vh',
    marginBottom: '15vh',
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  dialogActions: {
    padding: theme.spacing(1, 3, 2),
  },
  flexGrow: {
    flexGrow: 1,
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  timeline: {
    padding: 0,
  },
  timelineDate: {
    maxWidth: 135,
  },
  detailList: {
    position: 'relative',
    marginLeft: theme.spacing(2),

    '&>div::before': {
      content: '"–"',
      position: 'absolute',
      left: -theme.spacing(1.5),
    },
  },
}));


export interface Props {
  onClose: () => void,
  onShowContact: () => void,
  open: boolean,
}

export function formatTimelineDate(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}


const Changelog = ({ onClose, open }: Props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const lastView = useSelector((state: RootState) => state.changelogView);
  const handleClose = React.useCallback(
    () => {
      dispatch(setChangelogView());
      onClose();
    },
    [dispatch, onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className={classes.root}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6" className={classes.flexGrow}>
          CrossAngles Changelog
        </Typography>

        <IconButton
          aria-label="close"
          onClick={handleClose}
          className={classes.moveRight}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Timeline className={classes.timeline}>
          {changelog.map((item, i) => (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent className={classes.timelineDate}>
                <Typography color="textSecondary">{formatTimelineDate(item.date)}</Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot
                  color={item.date > lastView ? 'secondary' : undefined}
                />
                {i < changelog.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Typography>{item.summary}</Typography>
                <Typography
                  className={classes.detailList}
                  color="textSecondary"
                  component="div"
                  variant="caption"
                >
                  {item.details?.map(detail => (
                    <div key={detail}>{detail}</div>
                  ))}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleClose}
          fullWidth
          variant="outlined"
          color="primary"
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Changelog;
