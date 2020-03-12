import React, { Component, KeyboardEvent } from 'react';

// Components
import Typography from '@material-ui/core/Typography';
import HighlightedText from "./HighlightedText";
import MenuItem from '@material-ui/core/MenuItem';
import { OptionProps } from 'react-select/lib/components/Option';
import { NoticeProps } from 'react-select/lib/components/Menu';
import { CourseData } from '../../state/Course';

export type Props = OptionProps<CourseData>

export class Option extends Component<Props> {
  render () {
    const text: string[] = [
      this.props.data.code,
      this.props.data.name,
      this.props.data.term,
    ]
    if (this.props.data.isAdditional) {
      // Don't show course code for additional courses
      text.shift();
    }
    const separator = this.props.selectProps.OptionProps.separator;

    // Update event handlers for disabled items
    const innerProps = Object.assign({}, this.props.innerProps);
    if (this.props.isDisabled) {
      innerProps.onClick = this.handleClick;
    }

    const classes = this.props.selectProps.classes;

    return (
      <MenuItem
        ref={this.props.innerRef}
        selected={this.props.isFocused}
        component="div"
        onKeyPress={this.handleKeyPress}
        {...innerProps}
        data-cy="autocomplete-option"
      >
        {!this.props.isDisabled ? (
          <React.Fragment>
            <HighlightedText
              text={text[0]}
              search={this.props.selectProps.OptionProps.search}
              classes={classes}
            />
            {text[1] && (
              <span className={classes.lightText}>
                <span className={classes.preserveWhitespace}>{separator}</span>
                <HighlightedText
                  text={text[1]}
                  search={this.props.selectProps.OptionProps.search}
                  classes={classes}
                />
              </span>
            )}
            {text[2] && (
              <span className={classes.preserveWhitespace}> ({text[2]})</span>
            )}
          </React.Fragment>
        ) : (
          <Typography color="textSecondary">
            {text}
          </Typography>
        )}
      </MenuItem>
    );
  }

  shouldComponentUpdate (nextProps: Props) {
    if (this.props.isFocused !== nextProps.isFocused) {
      return true;
    }

    if (this.props.isDisabled !== nextProps.isDisabled) {
      return true;
    }

    if (this.props.children && nextProps.children) {
      if (this.props.children.toString() !== nextProps.children.toString()) {
        return true;
      }
    }

    if (this.props.selectProps.OptionProps.search !== nextProps.selectProps.OptionProps.search) {
      return true;
    }

    return false;
  }

  handleClick = () => {
    this.props.selectProps.OptionProps.onLoadMoreItems();
  }

  handleKeyPress = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'enter' && this.props.isDisabled) {
      this.props.selectProps.OptionProps.onLoadMoreItems();
    }
  }
}

export const NoOptionsMessage = (props: NoticeProps<CourseData>) => {
  return (
    <Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage}>
      {props.children}
    </Typography>
  )
}

export default Option;
