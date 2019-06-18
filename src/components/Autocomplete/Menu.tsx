import React, { PureComponent } from 'react';
import { MenuProps } from 'react-select/lib/components/Menu';
import { Course } from '../../state';
import Paper from '@material-ui/core/Paper';

export interface Props extends MenuProps<Course> {}

class Menu extends PureComponent<Props> {
  render () {
    return (
      <Paper
        square
        className={this.props.selectProps.classes.menu}
        {...this.props.innerProps}
      >
        {this.props.children}
      </Paper>
    );
  }

  // shouldComponentUpdate (nextProps: Props) {
  //   if (this.props.options !== nextProps.options) {
  //     console.log('should menu update', true);
  //     return true;
  //   }

  //   console.log(this.props.selectProps.inputValue);
  //   if (this.props.selectProps.inputValue !== nextProps.selectProps.inputValue) {
  //     console.log('should menu update 2', true);
  //     return true;
  //   }

  //   if (this.focusedChildChanged(nextProps)) {
  //     console.log(this.props)
  //     console.log('should menu update3', true);
  //     return true;
  //   }

  //   console.log('should menu update', false);
  //   return false;
  // }

  // focusedChildChanged = (nextProps: Props): boolean => {
  //   try {
  //     let prev: any = this.props.children;
  //     let next: any =  nextProps.children;
  //     while (React.Children.count(prev) === 1) {
  //       prev = prev.props.children;
  //       next = next.props.children;
  //     }
  //     let prevChildFocused = -1;
  //     let nextChildFocused = -1;
  //     React.Children.forEach(prev, (option: Option, i: number) => {
  //       if (option.props.isFocused) { prevChildFocused = i; }
  //     })
  //     React.Children.forEach(next, (option: Option, i: number) => {
  //       if (option.props.isFocused) { nextChildFocused = i; }
  //     })

  //     return prevChildFocused !== nextChildFocused;
  //   } catch (error) {
  //     console.warn(error);
  //     console.warn('focusedChildChanged check failed, defaulting to true');
  //     return true;
  //   }
  // }
}

export default Menu;
