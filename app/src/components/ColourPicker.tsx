import React, { PureComponent } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import ColourControl from './Colour';
import { Colour } from '../state/Colours';

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
  value?: string | null,
  onChange: (colour: Colour) => void,
}

class ColourPicker extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

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
          {this.props.colours.map(colour => (
            <ColourControl
              key={colour}
              colour={colour}
              onClick={() => this.props.onChange(colour)}
              size={this.props.size}
              isSelected={colour === this.props.value}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ColourPicker);
