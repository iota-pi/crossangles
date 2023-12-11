import React, { ReactNode } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { event } from 'react-ga';

import Button from '@material-ui/core/Button';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CalendarIcon from '@material-ui/icons/CalendarToday';
import CircularProgress from '@material-ui/core/CircularProgress';
import { CourseData, Meta } from '../state';
import { CATEGORY } from '../analytics';

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
  buttonHolder: {
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    position: 'relative',
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
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
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
  additional: CourseData[],
  meta: Meta,
  disabled?: boolean,
  showSignup: boolean,
  isSavingICS: boolean,
  onSaveAsICS: () => void,
  className?: string,
}

export const ActionButtons = withStyles(styles)(({
  additional,
  meta,
  disabled,
  showSignup,
  isSavingICS,
  onSaveAsICS,
  className,
  classes,
}: Props) => {
  // Assumption: only one additional course will be auto-selected and has metadata
  const ministry = additional.filter(c => c.autoSelect && c.metadata)[0];

  const handleLinkClick = (destination?: string) => {
    event({
      category: CATEGORY,
      action: 'Signup Link',
      label: destination,
    });
  };

  let signupButton: ReactNode = null;
  if (ministry && showSignup) {
    const ministryMeta = ministry.metadata!;
    const isValid = ministryMeta.signupValidFor.some(
      ({ year, term }) => meta.year === year && meta.term === term,
    );

    if (isValid) {
      signupButton = (
        <Button
          variant="outlined"
          className={`${classes.baseButton} ${classes.signUpButton}`}
          size="large"
          endIcon={<OpenInNewIcon />}
          href={ministryMeta.signupURL}
          disabled={disabled}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleLinkClick(ministryMeta.signupURL)}
        >
          <div className={classes.centredText}>
            <div className={classes.fontNormal}>
              Sign Up for Term
              {' '}
              {meta.term}
            </div>
            <div className={classes.fontLight}>
              {ministry.name}
            </div>
          </div>
        </Button>
      );
    }
  }

  const rootClassList = [classes.root];
  if (className) rootClassList.push(className);
  const rootClasses = rootClassList.join(' ');

  return (
    <div className={rootClasses}>
      <div className={classes.buttonHolder}>
        <Button
          variant="outlined"
          className={classes.baseButton}
          size="large"
          color="primary"
          endIcon={<CalendarIcon />}
          onClick={onSaveAsICS}
          disabled={disabled || isSavingICS}
        >
          Add to Calendar

          {isSavingICS && (
            <CircularProgress
              size={24}
              className={classes.buttonProgress}
            />
          )}
        </Button>

        {signupButton}
      </div>
    </div>
  );
});

export default ActionButtons;
