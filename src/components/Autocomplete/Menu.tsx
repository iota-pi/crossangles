import React, { PureComponent } from 'react';
import { MenuProps } from 'react-select/lib/components/Menu';
import { CourseData } from '../../state/Course';
import Paper from '@material-ui/core/Paper';

export interface Props extends MenuProps<CourseData> {}

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
}

export default Menu;
