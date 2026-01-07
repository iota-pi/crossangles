import React from 'react';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Check from '@material-ui/icons/Check';
import { Colour, getColour } from '../state';
import { getOptions } from '../state/selectors';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    transition: theme.transitions.create('background-color'),

    '&$selected': {
      border: '1px solid white',
    },
    '&$rounded': {
      borderRadius: '50%',
    },
  },
  selected: {},
  rounded: {},
}));

export interface Props {
  colour: Colour,
  size: number,
  isSelected?: boolean,
  isCircle?: boolean,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
}

function ColourComponent({
  colour,
  isSelected = false,
  isCircle = false,
  onClick,
  size,
}: Props) {
  const classes = useStyles();
  const { darkMode } = useSelector(getOptions);
  const appliedClasses = [
    classes.root,
    isSelected ? classes.selected : '',
    isCircle ? classes.rounded : '',
  ].join(' ');

  return (
    <ButtonBase
      className={appliedClasses}
      style={{
        backgroundColor: getColour(colour, darkMode),
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    >
      {isSelected ? <Check /> : null}
    </ButtonBase>
  );
}

export default ColourComponent;
