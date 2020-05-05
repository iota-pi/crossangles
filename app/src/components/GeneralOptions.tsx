import React from 'react';
import { optionList, Options, OptionName } from '../state/Options';

// Styles
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
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
}));

export interface Props {
  options: Options,
  darkMode: boolean,
  onToggleOption: (option: OptionName) => void,
}

const GeneralOptions = ({
  options,
  darkMode,
  onToggleOption,
}: Props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={0} className={classes.root}>
      {optionList.map(([optionName, label]) => (
        <Grid item xs={12} sm={6} md={3} key={optionName}>
          <FormControlLabel
            control={
              <Switch
                checked={options[optionName] || false}
                onChange={() => onToggleOption(optionName)}
                color={darkMode ? 'primary' : 'secondary'}
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

export default GeneralOptions;
