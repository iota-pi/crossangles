import React, { Component } from 'react';
import { ValueContainerProps } from 'react-select/lib/components/containers';
import { CourseData } from '../../state/Course';

export interface Props extends ValueContainerProps<CourseData> {}

class ValueContainer extends Component<Props> {
  render () {
    return (
      <div
        className={this.props.selectProps.classes.valueContainer}
      >
        {this.props.children}
      </div>
    );
  }

  shouldComponentUpdate (nextProps: Props) {
    if (this.props.children !== nextProps.children) {
      return true;
    }

    return false;
  }
}

export default ValueContainer;
