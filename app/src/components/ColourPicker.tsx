import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ColourControl from './Colour';
import { Colour } from '../state';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
  },
  colourContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colour: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',

    '&$selected': {
      border: '1px solid white',
    },
  },
  selected: {},
}));

export interface Props {
  colours: Colour[],
  columns: number,
  size: number,
  value?: Colour | null,
  onChange: (colour: Colour) => void,
}

export const ColourPicker: React.FC<Props> = (
  { colours, columns, onChange, size, value }: Props,
) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div
        className={classes.colourContainer}
        style={{ width: size * columns }}
      >
        {colours.map(colour => {
          const isSelected = !!value && colour === value;

          return (
            <ColourControl
              key={colour}
              colour={colour}
              onClick={() => onChange(colour)}
              size={size}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColourPicker;
