import React, { PureComponent } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import ColourControl from './Colour';
import { Colour, getColourObject } from '../state/Colours';

const styles = (theme: Theme) => createStyles({
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
    }
  },
  selected: {},
});

export interface Props extends WithStyles<typeof styles> {
  colours: Colour[],
  columns: number,
  size: number,
  darkMode: boolean,
  value?: Colour | null,
  onChange: (colour: Colour) => void,
}

class ColourPicker extends PureComponent<Props> {
  render() {
    const { classes, darkMode, value } = this.props;

    return (
      <div
        className={classes.root}
        data-cy="colour-picker"
      >
        <div
          className={classes.colourContainer}
          style={{
            width: this.props.size * this.props.columns,
          }}
        >
          {this.props.colours.map(colour => {
            const simpleColour = getColourObject(colour, darkMode);
            const isSelected = !!value && simpleColour === getColourObject(value, darkMode);

            return (
              <ColourControl
                key={simpleColour}
                colour={colour}
                onClick={() => this.props.onChange(colour)}
                size={this.props.size}
                darkMode={darkMode}
                isSelected={isSelected}
              />
            );
          })}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ColourPicker);
