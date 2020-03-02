import React from 'react';
import Button from '@material-ui/core/Button';
import { Meta } from '../state/Meta';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CameraAltIcon from '@material-ui/icons/CameraAlt';

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
  buttonHolder: {
    display: 'flex',
    flexDirection: 'column',
  },
  baseButton: {
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: 26,
    minHeight: 52,
    marginBottom: theme.spacing(2),
  },
  signUpButton: {
    borderColor: theme.palette.grey[700],
    lineHeight: 1.35,
    paddingTop: 5,
    paddingBottom: 5,
    textTransform: 'none',
  },
  saveImageButton: {

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
  showSignup: boolean,
  onSaveAsImage: () => void,
  className?: string,
}

export const ActionButtons = withStyles(styles)(({
  meta,
  showSignup,
  onSaveAsImage,
  className,
  classes,
}: Props) => {
  const rootClassList = [classes.root];
  if (className) rootClassList.push(className);
  const rootClasses = rootClassList.join(' ');

  return (
    <div className={rootClasses}>
      <div className={classes.buttonHolder}>
        <Button
          variant="outlined"
          className={classes.baseButton + ' ' + classes.saveImageButton}
          size="large"
          color="primary"
          endIcon={<CameraAltIcon />}
          onClick={onSaveAsImage}
        >
          Save as Image
        </Button>

        {showSignup && (
          <Button
            variant="outlined"
            className={classes.baseButton + ' ' + classes.signUpButton}
            size="large"
            endIcon={<OpenInNewIcon />}
            href={meta.signupURL}
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
        )}
      </div>
    </div>
  )
});
