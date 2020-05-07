import React, { ChangeEvent } from 'react';
import matchSorter from 'match-sorter';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core';
import ListboxComponent from './ListboxComponent';
import { CourseData } from '../state/Course';

export interface Props {
  maxItems?: number,
  separator?: string,
  courses: CourseData[],
  chosen: CourseData[],
  additional: CourseData[],
  chooseCourse: (course: CourseData) => void,
}


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  iconContainer: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1),
  },
  selectContainer: {
    flexGrow: 1,
  },
  popupIndicator: {
    transition: theme.transitions.create(['transform', 'backgroundColor']),
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
  const options = React.useMemo(() => {
    let availableOptions = courses.filter(course => !course.isCustom);
    availableOptions.sort((a, b) => +(a.code > b.code) - +(a.code < b.code));
    return availableOptions;
  }, [courses]);

  const filterOptions = (options: CourseData[], { inputValue }: FilterOptionsState<CourseData>) => {
    return matchSorter(options, inputValue, { keys: ['code', 'name'] });
  };

  const [focused, setFocused] = React.useState(true);
  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const [openOnFocus, setOpenOnFocus] = React.useState(false);
  React.useEffect(() => setOpenOnFocus(true), []);

  const handleChange = (event: ChangeEvent<{}>, newCourses: CourseData[] | null) => {
    if (newCourses) {
      const newCourse = newCourses[newCourses.length - 1];
      chooseCourse(newCourse);
    }
  };

  return (
    <Autocomplete
      id="course-selection-autocomplete"
      options={options}
      filterOptions={filterOptions}
      ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      openOnFocus={openOnFocus}
      autoHighlight
      multiple
      filterSelectedOptions
      disableClearable
      clearOnBlur={false}
      value={allChosen}
      getOptionLabel={option => option.code}
      noOptionsText="No matching courses found"
      renderInput={params => (
        <div className={classes.root}>
          <div className={classes.iconContainer}>
            <SearchIcon color={focused ? "primary" : undefined} />
          </div>
          <TextField
            {...params}
            label="Tap to select your courses…"
            autoFocus
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
          <div data-cy="autocomplete-option">
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
