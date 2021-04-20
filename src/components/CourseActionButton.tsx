import React, { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';


const useStyles = makeStyles(theme => {
  const transition = {
    duration: theme.transitions.duration.shorter,
  };

  return {
    expandIcon: {
      transform: 'rotate(0deg)',
      transition: theme.transitions.create('transform', transition),

      '&$flipped': {
        transform: 'rotate(180deg)',
      },
    },
    flipped: {},
    listIcon: {
      minWidth: 'initial',
    },
  };
});

export interface Props {
  flipped?: boolean,
  onClick: () => void,
}

export const CourseActionButton: React.FC<Props> = ({
  children,
  flipped,
  onClick,
}: PropsWithChildren<Props>) => {
  const classes = useStyles();
  return (
    <ListItemIcon
      className={classes.listIcon}
    >
      <IconButton
        size="small"
        onClick={onClick}
        className={`${classes.expandIcon} ${flipped ? classes.flipped : ''}`}
      >
        {children}
      </IconButton>
    </ListItemIcon>
  );
};

export default CourseActionButton;
