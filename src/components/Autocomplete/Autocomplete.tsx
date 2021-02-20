import React from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import SearchIcon from '@material-ui/icons/Search';
import ListboxComponent from './ListboxComponent';
import PaperComponent, { Props as PaperComponentProps } from './PaperComponent';
import { CourseData, getCourseId, getClarificationText } from '../../state';
import { useFilterWorker } from './filter.worker.shim';

export interface Props {
  separator?: string,
  courses: CourseData[],
  chosen: CourseData[],
  additional: CourseData[],
  chooseCourse: (course: CourseData) => void,
  onAddPersonalEvent: (search: string) => void,
}

const SEARCH_DEBOUNCE = 100;
const QUICK_SEARCH_DEBOUNCE = 10;

function earlyExitFilter<T>(items: T[], func: (item: T) => boolean) {
  const results: T[] = [];
  for (let i = 0; i < items.length; ++i) {
    const o = items[i];
    if (func(o)) {
      results.push(o);
    } else if (results.length > 0) {
      // Early exit on the first non-match after at least one successful match
      break;
    }
  }
  return results;
}


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

type InputProps = AutocompleteRenderInputParams & {
  inputValue: string,
};

const AutocompleteInput: React.FC<InputProps> = (props: InputProps) => {
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


export interface OptionProps {
  option: CourseData,
  value: string,
}

const AutocompleteOption: React.FC<OptionProps> = ({ option, value }: OptionProps) => {
  const classes = useStyles();

  const name = ` — ${option.name}`;
  const codeMatches = match(option.code, value);
  const nameMatches = match(name, value);
  const codeParts = parse(option.code, codeMatches).map(
    (part, i) => ({ ...part, key: `${part.text}-${i}` }),
  );
  const nameParts = parse(name, nameMatches).map(
    (part, i) => ({ ...part, key: `${part.text}-${i}` }),
  );
  const clarification = getClarificationText(option);

  return (
    <div data-cy="autocomplete-option" className={classes.autocompleteOption}>
      {codeParts.map(part => (
        <span key={part.key} style={{ fontWeight: part.highlight ? 500 : 400 }}>
          {part.text}
        </span>
      ))}
      {nameParts.map(part => (
        <span key={part.key} style={{ fontWeight: part.highlight ? 500 : 300 }}>
          {part.text}
        </span>
      ))}
      {clarification ? ` (${clarification})` : ''}
    </div>
  );
};


const AutocompleteControl: React.FC<Props> = ({
  courses,
  chosen,
  additional,
  chooseCourse,
  onAddPersonalEvent,
}) => {
  const classes = useStyles();

  const [inputValue, setInputValue] = React.useState('');

  const worker = useFilterWorker();

  const allChosen = React.useMemo(() => [...chosen, ...additional], [chosen, additional]);
  const allOptions = React.useMemo(
    () => {
      const allChosenIds = allChosen.map(c => getCourseId(c));
      let availableOptions = courses.filter(course => !course.isCustom);
      availableOptions = availableOptions.filter(
        course => !allChosenIds.includes(getCourseId(course)),
      );
      availableOptions.sort((a, b) => +(a.code > b.code) - +(a.code < b.code));
      const cachedOptions: CourseData[] = availableOptions.map(o => ({ ...o, lowerCode: o.code }));
      return cachedOptions;
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
            const results = earlyExitFilter(
              allOptions,
              o => o.lowerCode?.startsWith(lowerInputValue) || false,
            );
            if (results.length) {
              setFilteredOptions(results);
            }
          }
        },
        QUICK_SEARCH_DEBOUNCE,
      );

      const fullSearch = setTimeout(
        async () => {
          if (inputValue.length === 0) {
            setFilteredOptions(allOptions);
          } else {
            const results = await worker.runFilter(allOptions, inputValue);
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
    [inputValue, allOptions, worker],
  );

  // This hack prevents the ref of this dummy value array from changing
  const constantValue = React.useState([])[0];

  const handleChange = React.useCallback(
    (_: any, newCourses: CourseData[] | null) => {
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
    (props: AutocompleteRenderInputParams) => (
      <AutocompleteInput {...props} inputValue={inputValue} />
    ),
    [inputValue],
  );

  const renderOption = React.useCallback(
    (option, { inputValue: value }) => <AutocompleteOption option={option} value={value} />,
    [],
  );

  const renderTags = React.useCallback(() => null, []);

  const childClasses = React.useMemo(
    () => ({ popupIndicator: classes.popupIndicator }),
    [classes],
  );

  const getOptionLabel = React.useCallback((option: CourseData) => option.code, []);

  const handleAddPersonalEvent = React.useCallback(
    () => {
      onAddPersonalEvent(inputValue);
    },
    [inputValue, onAddPersonalEvent],
  );

  const Paper = React.useCallback(
    (props: Omit<PaperComponentProps, 'onAddPersonalEvent'>) => {
      const { children, ...other } = props;
      return (
        <PaperComponent onAddPersonalEvent={handleAddPersonalEvent} {...other}>
          {children}
        </PaperComponent>
      );
    },
    [handleAddPersonalEvent],
  );


  return (
    <Autocomplete
      id="course-selection-autocomplete"
      options={filteredOptions}
      filterOptions={noFilter}
      ListboxComponent={ListboxComponent as any}
      PaperComponent={Paper}
      onChange={handleChange}
      onInputChange={handleInputChange}
      autoHighlight
      multiple
      disableClearable
      clearOnBlur={false}
      value={constantValue}
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
