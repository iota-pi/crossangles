import React, { PureComponent, MouseEvent } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import Check from '@material-ui/icons/Check';

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    transition: 'background-color 0.3s',

    '&$selected': {
      border: '1px solid white',
    },
    '&$rounded': {
      borderRadius: '50%',
    }
  },
  selected: {},
  rounded: {},
});

export interface Props extends WithStyles<typeof styles> {
  colour: string,
  size: number,
  isSelected?: boolean,
  isCircle?: boolean,
  onClick: (event: MouseEvent<HTMLDivElement>) => void,
}

class Colour extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;
    const appliedClasses = [
      classes.root,
      this.props.isSelected ? classes.selected : '',
      this.props.isCircle ? classes.rounded : '',
    ].join(' ');

    return (
      <div
        className={appliedClasses}
        style={{
          backgroundColor: this.props.colour,
          width: this.props.size,
          height: this.props.size,
        }}
        onClick={this.props.onClick}
        data-cy="colour-selector"
      >
        {this.props.isSelected ? <Check/> : null}
      </div>
    )
  }
}

export default withStyles(styles)(Colour);
