import React, { PureComponent } from 'react';
import Select from 'react-select';
import { CourseData } from '../../state/Course';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

// Components
import Control from './Control';
import ValueContainer from './ValueContainer';
import DropdownIndicator from './DropdownIndicator';
import Menu from './Menu';
import { Option, NoOptionsMessage } from './Option';
import { InputActionMeta } from 'react-select/lib/types';
import { TextFieldProps } from '@material-ui/core/TextField';
import Search from '@material-ui/icons/Search';


const styles = (theme: Theme) => createStyles({
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
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto',
    color: theme.palette.text.primary,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
    lineHeight: '20px',
    paddingBottom: theme.spacing(0.5),

    // This hack is needed to force react-select to use correct colour in dark mode
    '& div': {
      color: theme.palette.text.primary,
    },
  },
  dropDown: {
    transition: theme.transitions.create('all'),
  },
  dropDownUp: {
    transform: 'rotate(180deg)',
  },
  dropDownFocus: {
    color: theme.palette.primary.main,
  },
  menu: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0,
  },
  preserveWhitespace: {
    whiteSpace: 'pre',
  },
  part: {
    whiteSpace: 'pre',
  },
  lightText: {
    fontWeight: 300,
    '& $highlight': {
      fontWeight: 400,
    },
  },
  highlight: {
    fontWeight: 500,
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2),
  },
});

export interface CourseOption extends CourseData {
  isDisabled?: boolean
};

export interface Props extends WithStyles<typeof styles> {
  maxItems?: number,
  separator?: string,
  courses: CourseData[],
  chosen: CourseData[],
  additional: CourseData[],
  chooseCourse: (course: CourseData) => void,
}

export interface State {
  search: string,
  currentMaxItems: number,
  menuOpen: boolean,
  focused: boolean,
}


const DEFAULT_MAX_ITEMS = 10;

class Autocomplete extends PureComponent<Props, State> {
  inputRef = React.createRef<any>();

  constructor (props: Props) {
    super(props);

    this.state = {
      search: '',
      currentMaxItems: this.props.maxItems || DEFAULT_MAX_ITEMS,
      menuOpen: false,
      focused: false,
    }
  }

  private components = {
    Control,
    ValueContainer,
    DropdownIndicator,
    IndicatorSeparator: null,
    Menu,
    Option,
    NoOptionsMessage,
    Placeholder: () => <></>,
  }

  render () {
    const classes = this.props.classes;
    const separator = this.props.separator || ' — ';

    return (
      <div className={classes.root}>
        <div className={classes.iconContainer} onClick={this.focusInput}>
          <Search color={this.state.focused ? "primary" : undefined} />
        </div>

        <div className={classes.selectContainer}>
          <Select
            ref={this.inputRef}
            components={this.components}
            onChange={this.handleChange as (course: any) => void}
            onInputChange={this.handleInputChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onMenuOpen={this.handleMenuOpen}
            onMenuClose={this.handleMenuClose}
            options={this.options}
            filterOption={() => true}
            value={null}
            label={null}
            inputValue={this.state.search}
            noOptionsMessage={() => 'No matching courses found'}
            autoFocus
            menuIsOpen={this.state.menuOpen}
            classes={this.props.classes}
            id="course-selection-autocomplete"
            TextFieldProps={{
              label: 'Tap to select your courses…',
              value: this.state.search,
              placeholder: 'COMP1511',
            } as TextFieldProps}
            OptionProps={{
              search: this.state.search,
              onLoadMoreItems: this.handleLoadMoreItems,
              separator,
            }}
            DropdownIndicatorProps={{
              open: this.state.menuOpen,
              focused: this.state.focused,
            }}
          />
        </div>
      </div>
    );
  }

  private handleChange = (course: CourseData | null | undefined) => {
    if (course) {
      this.props.chooseCourse(course);
    }
    this.resetMaxItems();
  }

  private handleInputChange = (search: string, { action }: InputActionMeta) => {
    const listeningTo = ['set-value', 'input-change', 'input-blur'];
    if (listeningTo.includes(action)) {
      this.setState({ search });
    }
  }

  private handleFocus = () => {
    this.setState({ focused: true });
  }

  private handleBlur = () => {
    this.setState({ focused: false });
    this.resetMaxItems();
  }

  private handleMenuOpen = () => {
    this.setState({ menuOpen: true });
  }
  private handleMenuClose = () => {
    this.setState({ menuOpen: false });
  }

  private handleLoadMoreItems = () => {
    this.setState({
      currentMaxItems: this.state.currentMaxItems + 20,
    });
  }

  private resetMaxItems = () => {
    this.setState({
      currentMaxItems: this.props.maxItems || DEFAULT_MAX_ITEMS,
    });
  }

  private focusInput = () => {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
      this.setState({ menuOpen: true });
    }
  }

  private get options (): CourseOption[] {
    // Filter out courses which don't match the search
    const search = this.state.search.toLowerCase().trim();
    const options: CourseOption[] = this.props.courses.filter(course => this.optionFilter(course, search));
    const chosen = [...this.props.chosen, ...this.props.additional];
    const availableOptions = options.filter(course => !chosen.includes(course));

    // Sort courses with matching course codes first
    const optionSort = this.getOptionSort(search);
    availableOptions.sort(optionSort);

    const maxItems = this.state.currentMaxItems;
    if (availableOptions.length > maxItems) {
      // Limit number of returned courses
      return [
        ...availableOptions.slice(0, maxItems),
        {
          code: 'See more results...',
          name: '',
          streams: [],
          isDisabled: true,
        },
      ];
    }

    return availableOptions;
  }

  private optionFilter = (course: CourseData, search: string): boolean => {
    // Include any courses which match the search in either their code or name
    const code = course.code.toLowerCase();
    if (code.includes(search)) {
      return true;
    }

    const name = course.name.toLowerCase();
    return name.includes(search);
  }

  private getOptionSort = (search: string) => {
    return (a: CourseData, b: CourseData): number => {
      if (search) {
        const matchesA = +a.code.toLowerCase().startsWith(search);
        const matchesB = +b.code.toLowerCase().startsWith(search);
        const order = (matchesB - matchesA);

        if (order !== 0) {
          return order;
        }
      }

      const alphabetical = +(a.code > b.code) - +(a.code < b.code);
      return alphabetical;
    }
  }
}

export default withStyles(styles)(Autocomplete);
