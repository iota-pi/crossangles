import React, { PureComponent } from 'react';
import { OptionList, Options, OptionName } from '../state';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Grid, FormControlLabel, Switch } from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
  root: {
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  lessSpaceAbove: {
    marginTop: -theme.spacing(0.5),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
});

export interface Props extends WithStyles<typeof styles> {
  options: Options,
  onToggleOption: (option: OptionName) => void,
}

class GeneralOptions extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <Grid container spacing={0} className={classes.root}>
        {OptionList.map(optionName => (
          <Grid item xs={12} sm={6} md={3} key={optionName}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.options[optionName]}
                  onChange={() => this.props.onToggleOption(optionName)}
                  value={optionName}
                />
              }
              className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
              label={optionName}
            />
          </Grid>
        ))}
      </Grid>
    )
  }
}

export default withStyles(styles)(GeneralOptions);
