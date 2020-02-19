import React, { PureComponent } from 'react';

export interface Props {
  text: string,
  search: string,
  classes: any,
}

export class HighlightedText extends PureComponent<Props> {
  render () {
    const search = this.props.search.toLowerCase();
    const classes = this.props.classes;

    if (this.props.text && search) {
      const parts = this.props.text.split(new RegExp(`(${search})`, 'i'));

      return parts.map((part, i) => (
        <span
          key={`part-${i}`}
          className={
            [classes.part, part.toLowerCase() === search ? classes.highlight : ''].join(' ')
          }
        >
          {part}
        </span>
      ));
    } else {
      return <React.Fragment>{this.props.text}</React.Fragment>;
    }
  }
}

export default HighlightedText;
