import React from 'react';
import Button from '@material-ui/core/Button';
import { Meta } from '../state/Meta';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
  roundedButton: {
    borderColor: theme.palette.grey[700],
    borderRadius: 26,
    lineHeight: 1.35,
    paddingTop: 5,
    paddingBottom: 5,
    textTransform: 'none',
  },
  fontNormal: {
    fontWeight: 500,
  },
  fontLight: {
    fontWeight: 400,
  },
  centredText: {
    textAlign: 'center',
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
});

export interface Props extends WithStyles<typeof styles> {
  meta: Meta,
  className?: string,
}

export const ActionButtons = withStyles(styles)(({
  meta,
  className,
  classes,
}: Props) => {
  const rootClassList = [classes.root];
  if (className) rootClassList.push(className);
  const rootClasses = rootClassList.join(' ');

  return (
    <div className={rootClasses}>
      <Button
        // color="secondary"
        variant="outlined"
        className={classes.roundedButton}
        size="large"
        href={meta.signupURL}
        endIcon={<OpenInNewIcon />}
        target="_blank"
      >
        <div className={classes.centredText}>
          <div className={classes.fontNormal}>
            Sign Up for Term {meta.term}
          </div>
          <div className={classes.fontLight}>
            {meta.ministryName}
          </div>
        </div>
      </Button>
    </div>
  )
});
