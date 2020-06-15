import React, { ChangeEvent } from 'react';
import matchSorter from 'match-sorter';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SearchIcon from '@material-ui/icons/Search';
import ListboxComponent from './ListboxComponent';
import { CourseData, getCourseId } from '../state';

export interface Props {
  maxItems?: number,
  separator?: string,
  courses: CourseData[],
  chosen: CourseData[],
  additional: CourseData[],
  chooseCourse: (course: CourseData) => void,
}

const SEARCH_DEBOUNCE = 100;
const QUICK_SEARCH_DEBOUNCE = 10;

const matchSorterOptions = {
  keys: ['code', 'name'],
};


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    transition: theme.transitions.create('border-color'),
  },
  searchIcon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  selectContainer: {
    flexGrow: 1,
  },
  inputLabel: {
    transition: theme.transitions.create('all'),
    marginLeft: 38,
  },
  shrunk: {
    marginLeft: 2,
  },
  popupIndicator: {
    transition: theme.transitions.create(['transform', 'backgroundColor']),
  },
  autocompleteOption: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));


const AutocompleteControl = ({
  courses,
  chosen,
  additional,
  chooseCourse,
}: Props) => {
  const classes = useStyles();
  const allChosen = React.useMemo(() => [...chosen, ...additional], [chosen, additional]);
  const allOptions = React.useMemo(() => {
    const allChosenIds = allChosen.map(c => getCourseId(c));
    let availableOptions = courses.filter(course => !course.isCustom);
    availableOptions = availableOptions.filter(course => !allChosenIds.includes(getCourseId(course)));
    availableOptions.sort((a, b) => +(a.code > b.code) - +(a.code < b.code));
    return availableOptions;
  }, [courses, allChosen]);

  const handleChange = (event: ChangeEvent<{}>, newCourses: CourseData[] | null) => {
    if (newCourses) {
      const newCourse = newCourses[newCourses.length - 1];
      chooseCourse(newCourse);
    }
  };

  const [inputValue, setInputValue] = React.useState('');
  const [focused, setFocused] = React.useState(true);

  const [filteredOptions, setFilteredOptions] = React.useState<typeof allOptions>(allOptions);
  React.useEffect(
    () => {
      const quickSearch = setTimeout(
        () => {
          if (inputValue.length === 0) {
            setFilteredOptions(allOptions);
          } else {
            const lowerInputValue = inputValue.toLowerCase();
            const results = allOptions.filter(o => o.code.toLowerCase().startsWith(lowerInputValue));
            results.concat(allOptions.filter(o => o.code.toLowerCase().includes(lowerInputValue)));
            results.concat(allOptions.filter(o => o.name.toLowerCase().includes(lowerInputValue)));
            if (results.length) {
              setFilteredOptions(results);
            }
          }
        },
        QUICK_SEARCH_DEBOUNCE,
      );

      const fullSearch = setTimeout(
        () => {
          if (inputValue.length === 0) {
            setFilteredOptions(allOptions);
          } else {
            const results = matchSorter(allOptions, inputValue, matchSorterOptions);
            setFilteredOptions(results);
          }
        },
        SEARCH_DEBOUNCE,
      );

      return () => {
        clearTimeout(quickSearch);
        clearTimeout(fullSearch);
      }
    },
    [inputValue, allOptions],
  );

  // This hack prevents the ref of this dummy value array from changing
  const value = React.useState([])[0];

  return (
    <Autocomplete
      debug
      id="course-selection-autocomplete"
      options={filteredOptions}
      filterOptions={o => o}
      ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
      onChange={handleChange}
      onInputChange={(_, value) => setInputValue(value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      autoHighlight
      multiple
      disableClearable
      clearOnBlur={false}
      value={value}
      inputValue={inputValue}
      getOptionLabel={option => option.code}
      noOptionsText="No matching courses found"
      renderInput={params => (
        <div className={classes.root}>
          <TextField
            {...params}
            label="Select your courses"
            variant="outlined"
            autoFocus
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <SearchIcon
                  color={focused ? 'primary' : undefined}
                  className={classes.searchIcon}
                />
              ),
            }}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: focused || inputValue.length > 0,
              className: `${classes.inputLabel} ${focused || inputValue.length > 0 ? classes.shrunk : ''}`,
            }}
          />
        </div>
      )}
      renderOption={(option, { inputValue }) => {
        const name = ` — ${option.name}`
        const codeMatches = match(option.code, inputValue);
        const codeParts = parse(option.code, codeMatches);
        const nameMatches = match(name, inputValue);
        const nameParts = parse(name, nameMatches);

        return (
          <div data-cy="autocomplete-option" className={classes.autocompleteOption}>
            {codeParts.map((part, index) => (
              <span key={index} style={{ fontWeight: part.highlight ? 500 : 400 }}>
                {part.text}
              </span>
            ))}
            {nameParts.map((part, index) => (
              <span key={index} style={{ fontWeight: part.highlight ? 500 : 300 }}>
                {part.text}
              </span>
            ))}
            {option.term ? ` (${option.term})` : ''}
          </div>
        );
      }}
      renderTags={() => null}
      classes={{ popupIndicator: classes.popupIndicator }}
    />
  )
}

export default AutocompleteControl;
