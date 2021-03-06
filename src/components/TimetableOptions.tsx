import React from 'react';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { timetableOptionList, Options, OptionName } from '../state';
import { getOptions } from '../state/selectors';

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
    flexGrow: 1,
    flexBasis: '100%',

    [theme.breakpoints.up('sm')]: {
      flexBasis: '50%',
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
  onToggleOption: (option: OptionName) => void,
}

const TimetableOptionsComponent = ({
  options,
  onToggleOption,
}: Props) => {
  const classes = useStyles();
  const { darkMode } = useSelector(getOptions);

  return (
    <div className={classes.root}>
      {timetableOptionList.map(([optionName, label]) => (
        <div className={classes.optionContainer} key={optionName}>
          <FormControlLabel
            control={(
              <Switch
                checked={options[optionName] || false}
                onChange={() => onToggleOption(optionName)}
                color={darkMode ? 'primary' : 'secondary'}
                value={optionName}
                classes={{ track: classes.selectTrack }}
              />
            )}
            className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
            label={label}
          />
        </div>
      ))}
    </div>
  );
};
const TimetableOptions = React.memo(TimetableOptionsComponent);

export default TimetableOptions;
