import React from 'react';
import { optionList, Options, OptionName } from '../state/Options';

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

const GeneralOptions = ({
  classes,
  options,
  onToggleOption,
}: Props) => {
  return (
    <Grid container spacing={0} className={classes.root}>
      {optionList.map(([optionName, label]) => (
        <Grid item xs={12} sm={6} md={3} key={optionName}>
          <FormControlLabel
            control={
              <Switch
                checked={options[optionName] || false}
                onChange={() => onToggleOption(optionName)}
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
  );
}

export default withStyles(styles)(GeneralOptions);
