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
import { generalOptionList, OptionName } from '../state';
import { getOptions } from '../state/selectors';
import { toggleOption } from '../actions';


const useStyles = makeStyles(theme => ({
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  dialogActions: {
    flexDirection: 'column',
    padding: theme.spacing(1, 3, 2),
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
  marginBottom: {
    marginBottom: theme.spacing(1),
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  selectTrack: {
    opacity: 0.6 * 0.38,
  },
  optionLabel: {
    cursor: 'pointer',
  },
}));


export interface Props {
  onViewChangelog: () => void,
}


const AppOptions = ({ onViewChangelog }: Props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const options = useSelector(getOptions);
  const { darkMode } = options;
  const [showDialog, setShowDialog] = React.useState(false);

  const handleOpen = React.useCallback(
    () => {
      setShowDialog(true);
      modalview('about-crossangles');
    },
    [],
  );
  const handleClose = React.useCallback(() => setShowDialog(false), []);
  const handleChange = React.useCallback(
    (option: OptionName) => dispatch(toggleOption(option)),
    [dispatch],
  );
  const handleViewChangelog = React.useCallback(
    () => {
      handleClose();
      onViewChangelog();
    },
    [handleClose, onViewChangelog],
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
          {generalOptionList.map(([name, label]) => (
            <div className={classes.optionContainer} key={name}>
              <Typography
                className={classes.optionLabel}
                onClick={() => handleChange(name)}
              >
                {label}
              </Typography>

              <Switch
                checked={options[name] || false}
                onChange={() => handleChange(name)}
                color={darkMode ? 'primary' : 'secondary'}
                classes={{ track: classes.selectTrack }}
              />
            </div>
          ))}
        </DialogContent>

        <DialogActions className={classes.dialogActions} disableSpacing>
          <Button
            onClick={handleViewChangelog}
            className={classes.marginBottom}
            fullWidth
            variant="outlined"
          >
            View Changelog
          </Button>

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
export default AppOptions;
