import React, { PureComponent } from 'react';
import { OptionList, Options, OptionName } from '../state/Options';

// Styles
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';

const styles = (theme: Theme) => createStyles({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  lessSpaceAbove: {
    marginTop: -theme.spacing(0.5),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
  selectTrack: {
    opacity: 0.6 * 0.38,
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
        {Array.from(OptionList.entries()).map(([optionName, label]) => (
          <Grid item xs={12} sm={6} md={3} key={optionName}>
            <FormControlLabel
              control={
                <Switch
                  checked={this.props.options[optionName] || false}
                  onChange={() => this.props.onToggleOption(optionName)}
                  value={optionName}
                  classes={{
                    track: classes.selectTrack,
                  }}
                />
              }
              className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
              label={label}
            />
          </Grid>
        ))}
      </Grid>
    )
  }
}

export default withStyles(styles)(GeneralOptions);
