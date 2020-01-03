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


const styles = (theme: Theme) => createStyles({
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
    lineHeight: '20px',
    paddingBottom: theme.spacing(0.5),
  },
  dropDown: {
    transition: 'all 0.3s',
  },
  dropDownUp: {
    transform: 'rotate(180deg)',
  },
  dropDownFocus: {
    color: theme.palette.primary.main,
  },
  menu: {
    position: 'absolute',
    zIndex: 1,
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
    const separator = this.props.separator || ' — ';

    return (
      <Select
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
        noOptionsMessage={() => 'No matching courses found'}
        autoFocus
        classes={this.props.classes}
        id="course-selection-autocomplete"
        TextFieldProps={{
          label: 'Select your courses…',
          value: this.state.search,
        }}
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
    );
  }

  private handleChange = (course: CourseData | null | undefined) => {
    if (course) {
      this.props.chooseCourse(course);
    }
    this.resetMaxItems();
  }

  private handleInputChange = (search: string) => {
    this.setState({ search });
  }

  private handleFocus = () => {
    this.setState({ focused: true });
  }

  private handleBlur = () => {
    this.resetMaxItems();
    this.setState({ focused: false });
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

  private get options (): CourseOption[] {
    // Filter out courses which don't match the search
    const search = this.state.search.toLowerCase();
    const options: CourseOption[] = this.props.courses.filter(course => this.optionFilter(course, search));

    // Sort courses with matching course codes first
    options.sort(this.optionSort);

    const maxItems = this.state.currentMaxItems;
    if (options.length > maxItems) {
      // Limit number of returned courses
      return options.slice(0, maxItems).concat([{
        code: 'See more results...',
        name: '',
        streams: [],
        isDisabled: true,
      }]);
    }

    return options;
  }

  private optionFilter = (course: CourseData, search: string): boolean => {
    // Pre: search is lowercase

    // Don't include already chosen courses
    if (this.props.chosen.includes(course) || this.props.additional.includes(course)) {
      return false;
    }

    // Include any courses which match the search in either their code or name
    const code = course.code.toLowerCase();
    const name = course.name.toLowerCase();
    return code.includes(search) || name.includes(search);
  }

  private optionSort = (a: CourseData, b: CourseData): number => {
    let search = this.state.search.toLowerCase();

    let alphaOrder = +(a.code > b.code) - +(a.code < b.code);

    if (search) {
      let matchesA = +a.code.toLowerCase().startsWith(search);
      let matchesB = +b.code.toLowerCase().startsWith(search);

      return (matchesB - matchesA) || alphaOrder;
    }

    return alphaOrder;
  }
}

export default withStyles(styles)(Autocomplete);
