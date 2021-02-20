import React from 'react';
import { Button, DialogActions, makeStyles, Paper, PaperProps } from '@material-ui/core';
import Event from '@material-ui/icons/Event';


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
  const classes = useStyles();

  return (
    <Paper {...other}>
      {children}

      <DialogActions className={classes.actions}>
        <Button
          color="secondary"
          fullWidth
          id="add-personal-event"
          size="large"
          startIcon={<Event />}
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
