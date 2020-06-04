import React, { MouseEvent } from 'react';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Check from '@material-ui/icons/Check';
import { RootState, Colour, getColour } from '../state';

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
    }
  },
  selected: {},
  rounded: {},
}));

export interface Props {
  colour: Colour,
  size: number,
  isSelected?: boolean,
  isCircle?: boolean,
  onClick?: (event: MouseEvent<HTMLDivElement>) => void,
}

function ColourComponent ({ colour, size, isSelected, isCircle, onClick }: Props) {
  const classes = useStyles();
  const darkMode = useSelector((state: RootState) => state.darkMode);
  const appliedClasses = [
    classes.root,
    isSelected ? classes.selected : '',
    isCircle ? classes.rounded : '',
  ].join(' ');

  return (
    <div
      className={appliedClasses}
      style={{
        backgroundColor: getColour(colour, darkMode),
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
      data-cy="colour-selector"
    >
      {isSelected ? <Check/> : null}
    </div>
  );
}

export default ColourComponent;
