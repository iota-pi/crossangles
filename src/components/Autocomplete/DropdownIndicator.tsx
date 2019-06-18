import React, { PureComponent } from 'react';
import { Course } from '../../state';
import { IndicatorProps } from 'react-select/lib/components/indicators';
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

export interface Props extends IndicatorProps<Course> {}

class Menu extends PureComponent<Props> {
  render () {
    const { DropdownIndicatorProps, classes } = this.props.selectProps;
    const { open, focused } = DropdownIndicatorProps;
    const classList: string[] = [
      classes.dropDown,
      open ? classes.dropDownUp : '',
      focused ? classes.dropDownFocus : '',
    ].filter((c: string) => !!c);
    return (
      <ArrowDropDown className={classList.join(' ')} />
    );
  }
}

export default Menu;
