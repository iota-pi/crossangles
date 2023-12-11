import React from 'react';
import { useSelector } from 'react-redux';
import { Button, DialogActions, makeStyles, Paper, PaperProps } from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import { getOption } from '../../state';
import { getOptions } from '../../state/selectors';


const useStyles = makeStyles(theme => ({
  actions: {
    boxShadow: theme.shadows[2],
    padding: 0,
  },
}));


export interface Props extends PaperProps {
  onAddPersonalEvent: () => void,
}


// Adapter for react-window
const PaperComponent: React.FC<Props> = (props: Props) => {
  const { children, onAddPersonalEvent, ...other } = props;
  const options = useSelector(getOptions);
  const darkMode = getOption(options, 'darkMode');
  const classes = useStyles();

  return (
    <Paper {...other}>
      {children}

      <DialogActions className={classes.actions}>
        <Button
          color={darkMode ? 'primary' : 'secondary'}
          fullWidth
          id="add-personal-event"
          size="large"
          startIcon={<EventIcon />}
          onClick={onAddPersonalEvent}
          // Prevent default to stop blur on autocomplete input from triggering too early
          onMouseDown={e => e.preventDefault()}
        >
          Add Personal Event
        </Button>
      </DialogActions>
    </Paper>
  );
};

export default PaperComponent;
