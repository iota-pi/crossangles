import React, { Component } from 'react';

// Components
import Course from '../../state/Course';
import { ValueContainerProps } from 'react-select/lib/components/containers';

export interface Props extends ValueContainerProps<Course> {}

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
      console.log('should VC update', true);
      return true;
    }

    console.log('should VC update', false);
    return false;
  }
}

export default ValueContainer;
