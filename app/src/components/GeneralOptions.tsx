import React from 'react';
import { optionList, Options, OptionName } from '../state';

// Styles
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  optionContainer: {
    margin: 0,
    flexGrow: 0,
    maxWidth: '100%',
    flexBasis: '100%',

    [theme.breakpoints.only('sm')]: {
      maxWidth: '50%',
      flexBasis: '50%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '25%',
      flexBasis: '25%',
    },
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

const GeneralOptions = React.memo(({
  options,
  darkMode,
  onToggleOption,
}: Props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {optionList.map(([optionName, label]) => (
        <div className={classes.optionContainer} key={optionName}>
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
        </div>
      ))}
    </div>
  );
});

export default GeneralOptions;
