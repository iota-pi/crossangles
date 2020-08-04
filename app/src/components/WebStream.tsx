import React from 'react';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { StreamData } from '../state';
import { getOptions } from '../state/selectors';


const useStyles = makeStyles(theme => ({
  lessSpaceAbove: {
    marginTop: -theme.spacing(1),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
}));

export interface Props {
  checked: boolean,
  stream: StreamData,
  onChange: () => void,
}

function WebStream({ checked, stream, onChange }: Props) {
  const classes = useStyles();
  const { darkMode, includeFull } = useSelector(getOptions);

  const disabled = stream.full && !includeFull;
  let label = 'Choose online-only lecture stream';
  if (stream.full) {
    label += ' (full)';
  }

  return (
    <FormControlLabel
      label={label}
      className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
      control={(
        <Checkbox
          checked={checked && !disabled}
          onChange={onChange}
          color={darkMode ? 'primary' : 'secondary'}
          disabled={disabled}
          value
        />
      )}
      data-cy="web-stream-toggle"
    />
  );
}

export default WebStream;
