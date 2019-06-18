import React, { Component, KeyboardEvent } from 'react';

// Components
import Typography from '@material-ui/core/Typography';
import HighlightedText from "./HighlightedText";
import MenuItem from '@material-ui/core/MenuItem';
import Course from '../../state/Course';
import { OptionProps } from 'react-select/lib/components/Option';
import { NoticeProps } from 'react-select/lib/components/Menu';

export type Props = OptionProps<Course>

export class Option extends Component<Props> {
  render () {
    const text = (this.props.children || '').toString()

    // Update event handlers for disabled items
    const innerProps = Object.assign({}, this.props.innerProps);
    if (this.props.isDisabled) {
      innerProps.onClick = this.handleClick;
    }

    return (
      <MenuItem
        ref={this.props.innerRef}
        selected={this.props.isFocused}
        component="div"
        onKeyPress={this.handleKeyPress}
        {...innerProps}
      >
        {!this.props.isDisabled ? (
          <HighlightedText
            text={text}
            search={this.props.selectProps.OptionProps.search}
            classes={this.props.selectProps.classes}
          />
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
    console.log('handleClick')
    this.props.selectProps.OptionProps.onLoadMoreItems();
  }

  handleKeyPress = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'enter' && this.props.isDisabled) {
      this.props.selectProps.OptionProps.onLoadMoreItems();
    }
  }
}

export const NoOptionsMessage = (props: NoticeProps<Course>) => {
  return (
    <Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage}>
      {props.children}
    </Typography>
  )
}

export default Option;
