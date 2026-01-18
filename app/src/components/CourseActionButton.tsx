import React, { PropsWithChildren } from 'react'
import { makeStyles } from 'tss-react/mui'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'


const useStyles = makeStyles()(theme => {
  const transition = {
    duration: theme.transitions.duration.shorter,
  }

  return {
    expandIcon: {
      transform: 'rotate(0deg)',
      transition: theme.transitions.create('transform', transition),
    },
    flipped: {
      transform: 'rotate(180deg)',
    },
    listIcon: {
      minWidth: 'initial',
    },
  }
})

export interface Props {
  flipped?: boolean,
  onClick: () => void,
}

export const CourseActionButton: React.FC<PropsWithChildren<Props>> = ({
  children,
  flipped,
  onClick,
}) => {
  const { classes, cx } = useStyles()
  return (
    <ListItemIcon
      className={classes.listIcon}
    >
      <IconButton
        size="small"
        onClick={onClick}
        className={cx(classes.expandIcon, flipped && classes.flipped)}
      >
        {children}
      </IconButton>
    </ListItemIcon>
  )
}

export default CourseActionButton
