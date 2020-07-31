import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Settings from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';
import { modalview } from 'react-ga';
import { RootState } from '../state';
import { setCompactView, setReducedMotion } from '../actions';


const useStyles = makeStyles(theme => ({
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  flexGrow: {
    flexGrow: 1,
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  dialogActions: {
    padding: theme.spacing(1, 3, 2),
  },
  selectTrack: {
    opacity: 0.6 * 0.38,
  },
  optionLabel: {
    cursor: 'pointer',
  },
}));


export const AppOptions = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.darkMode);
  const compactView = useSelector((state: RootState) => state.compactView);
  const reducedMotion = useSelector((state: RootState) => state.reducedMotion);
  const [showDialog, setShowDialog] = React.useState(false);

  const handleOpen = React.useCallback(
    () => {
      setShowDialog(true);
      modalview('about-crossangles');
    },
    [],
  );
  const handleClose = React.useCallback(() => setShowDialog(false), []);
  const handleChangeCompact = React.useCallback(
    () => dispatch(setCompactView()),
    [dispatch],
  );
  const handleChangeAnimations = React.useCallback(
    () => dispatch(setReducedMotion()),
    [dispatch],
  );

  return (
    <div>
      <IconButton
        color="inherit"
        onClick={handleOpen}
      >
        <Settings />
      </IconButton>

      <Dialog
        open={showDialog}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6" className={classes.flexGrow}>
            Settings
          </Typography>

          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={classes.moveRight}
            data-cy="close-dialog"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <div className={classes.optionContainer}>
            <Typography
              className={classes.optionLabel}
              onClick={handleChangeCompact}
            >
              Compact Display
            </Typography>

            <Switch
              checked={compactView}
              onChange={handleChangeCompact}
              color={darkMode ? 'primary' : 'secondary'}
              classes={{ track: classes.selectTrack }}
            />
          </div>

          <div className={classes.optionContainer}>
            <Typography
              className={classes.optionLabel}
              onClick={handleChangeAnimations}
            >
              Reduced Animations
            </Typography>

            <Switch
              checked={reducedMotion}
              onChange={handleChangeAnimations}
              color={darkMode ? 'primary' : 'secondary'}
              classes={{ track: classes.selectTrack }}
            />
          </div>
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
    </div>
  );
};
