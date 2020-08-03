import React, { ChangeEvent } from 'react';
import matchSorter from 'match-sorter';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import SearchIcon from '@material-ui/icons/Search';
import { ListboxComponent } from './ListboxComponent';
import { CourseData, getCourseId, getClarificationText } from '../state';

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

const matchSorterOptions = { keys: ['code', 'name'] };


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

function noFilter<T>(x: T) { return x; }

interface InputProps extends AutocompleteRenderInputParams {
  inputValue: string,
}

const AutocompleteInput: React.FC<InputProps> = props => {
  const classes = useStyles();
  const [focused, setFocused] = React.useState(true);
  const onFocus = React.useCallback(() => setFocused(true), []);
  const onBlur = React.useCallback(() => setFocused(false), []);
  const { inputValue, ...textFieldProps } = props;

  return (
    <div className={classes.root}>
      <TextField
        {...textFieldProps}
        label="Select your courses"
        variant="outlined"
        autoFocus
        onFocus={onFocus}
        onBlur={onBlur}
        InputProps={{
          ...props.InputProps,
          startAdornment: (
            <SearchIcon
              color={focused ? 'primary' : undefined}
              className={classes.searchIcon}
            />
          ),
        }}
        InputLabelProps={{
          ...props.InputLabelProps,
          shrink: focused || inputValue.length > 0,
          classes: {
            root: classes.inputLabel,
            shrink: classes.shrunk,
          },
        }}
      />
    </div>
  );
};


const AutocompleteControl = ({
  courses,
  chosen,
  additional,
  chooseCourse,
}: Props) => {
  const classes = useStyles();

  const [inputValue, setInputValue] = React.useState('');

  const allChosen = React.useMemo(() => [...chosen, ...additional], [chosen, additional]);
  const allOptions = React.useMemo(
    () => {
      const allChosenIds = allChosen.map(c => getCourseId(c));
      let availableOptions = courses.filter(course => !course.isCustom);
      availableOptions = availableOptions.filter(course => !allChosenIds.includes(getCourseId(course)));
      availableOptions.sort((a, b) => +(a.code > b.code) - +(a.code < b.code));
      return availableOptions;
    },
    [courses, allChosen],
  );

  const [filteredOptions, setFilteredOptions] = React.useState<typeof allOptions>(allOptions);
  React.useEffect(
    () => {
      const quickSearch = setTimeout(
        () => {
          if (inputValue.length === 0) {
            setFilteredOptions(allOptions);
          } else {
            const lowerInputValue = inputValue.toLowerCase().trim();
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
            const query = inputValue.trim();
            const results = matchSorter(allOptions, query, matchSorterOptions);
            setFilteredOptions(results);
          }
        },
        SEARCH_DEBOUNCE,
      );

      return () => {
        clearTimeout(quickSearch);
        clearTimeout(fullSearch);
      };
    },
    [inputValue, allOptions],
  );

  // This hack prevents the ref of this dummy value array from changing
  const value = React.useState([])[0];

  const handleChange = React.useCallback(
    (event: ChangeEvent<{}>, newCourses: CourseData[] | null) => {
      if (newCourses) {
        const newCourse = newCourses[newCourses.length - 1];
        chooseCourse(newCourse);
      }
    },
    [chooseCourse],
  );
  const handleInputChange = React.useCallback(
    (_: any, value: string) => setInputValue(value),
    [setInputValue],
  );

  const renderInput = React.useCallback(
    (props: AutocompleteRenderInputParams) => <AutocompleteInput {...props} inputValue={inputValue} />,
    [inputValue],
  );

  const renderOption = React.useCallback(
    (option, { inputValue }) => {
      const name = ` — ${option.name}`;
      const codeMatches = match(option.code, inputValue);
      const codeParts = parse(option.code, codeMatches);
      const nameMatches = match(name, inputValue);
      const nameParts = parse(name, nameMatches);
      const clarification = getClarificationText(option);

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
          {clarification ? ` (${clarification})` : ''}
        </div>
      );
    },
    [classes],
  );

  const renderTags = React.useCallback(() => null, []);

  const childClasses = React.useMemo(
    () => ({ popupIndicator: classes.popupIndicator }),
    [classes],
  );

  const getOptionLabel = React.useCallback((option: CourseData) => option.code, []);


  return (
    <Autocomplete
      id="course-selection-autocomplete"
      options={filteredOptions}
      filterOptions={noFilter}
      ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
      onChange={handleChange}
      onInputChange={handleInputChange}
      autoHighlight
      multiple
      disableClearable
      clearOnBlur={false}
      value={value}
      inputValue={inputValue}
      getOptionLabel={getOptionLabel}
      noOptionsText="No matching courses found"
      renderInput={renderInput}
      renderOption={renderOption}
      renderTags={renderTags}
      classes={childClasses}
    />
  );
};

export default AutocompleteControl;
