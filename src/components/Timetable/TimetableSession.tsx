import React, { PureComponent, CSSProperties } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { Session, CBS_CODE, Course, Stream, Options } from '../../state';
import { Position, Dimensions } from './timetableTypes';
import { DraggableCore, DraggableData } from 'react-draggable';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
    cursor: 'grab',
    overflow: 'hidden',

    transition: 'box-shadow 0.3s, transform 0.3s',
    boxShadow: theme.shadows[3],

    '&$snapped:not($hovering)': {
      boxShadow: theme.shadows[0],
    },

    '&$dragging': {
      cursor: 'grabbing',
      transition: 'box-shadow 0.3s',
      boxShadow: theme.shadows[8],
    },
    '&$new': {
      transition: 'none',
    },
  },
  background: {
    transition: 'background-color 0.3s',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  new: {},
  dragging: {},
  snapped: {},
  hovering: {},
  sessionText: {
    position: 'relative',
    textAlign: 'center',
    fontWeight: 300,

    '& > $label': {
      lineHeight: 1.25,
      fontSize: '105%',

      '& > $em': {
        fontWeight: 500,
      },
    },
  },
  label: {},
  em: {},
  details: {
    lineHeight: 1.15,
    fontSize: '82%',

    '& > $moreSpace': {
      lineHeight: 1.2,
    },
  },
  moreSpace: {},
});

export interface Props extends WithStyles<typeof styles> {
  session: Session,
  colour: string,
  dimensions: Dimensions,
  position: Required<Position>,
  isDragging: boolean,
  isSnapped: boolean,
  clashDepth: number,
  options: Options,
  onDrag: (session: Session) => false | void,
  onMove: (session: Session, delta: Position) => void,
  onDrop: (session: Session) => void,
}

export interface State {
}

class TimetableSession extends PureComponent<Props, State> {
  state: State = {
  }

  render() {
    const { classes } = this.props;
    const rootClasses = [
      classes.root,
      this.props.isDragging ? classes.dragging : '',
      this.props.isSnapped ? classes.snapped : '',
      this.props.clashDepth > 0 ? classes.hovering : '',
    ].join(' ');

    return (
      <DraggableCore
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}
      >
        <div className={rootClasses} style={this.styles}>
          <div
            className={classes.background}
            style={{
              backgroundColor: this.props.colour,
            }}
          />

          <div className={classes.sessionText}>
            <div className={classes.label}>
              <span className={classes.em}>{this.sessionTitle} </span>
              <span>{this.sessionComponent}</span>
            </div>

            {this.details.map((detail, i) => (
              <div className={classes.details} key={`detail-${i}`}>
                {detail}
              </div>
            ))}
          </div>
        </div>
      </DraggableCore>
    )
  }

  private handleStart = () => {
    this.props.onDrag(this.props.session);
  }

  private handleDrag = (_: any, data: DraggableData) => {
    let x = data.deltaX;
    let y = data.deltaY;
    this.props.onMove(this.props.session, { x, y });
  }

  private handleStop = () => {
    return this.props.onDrop(this.props.session);
  }

  private get course (): Course {
    return this.props.session.course;
  }

  private get stream (): Stream {
    return this.props.session.stream;
  }

  private get isSpecialCourse (): boolean {
    // TODO handle custom courses
    return this.course.code === CBS_CODE;
  }

  private get sessionTitle (): string {
    if (this.isSpecialCourse) {
      return this.stream.component;
    }

    return this.course.code;
  }

  private get sessionComponent (): string {
    if (this.isSpecialCourse) {
      return '';
    }

    return this.stream.component;
  }

  private get details (): string[] {
    return [];
  }

  private get styles (): CSSProperties {
    const { dimensions, position } = this.props;
    const { width, height } = dimensions;
    const { x, y, z } = position;

    return {
      transform: `translate(${x}px, ${y}px)`,
      width,
      height,
      zIndex: z,
    };
  }
}

export default withStyles(styles)(TimetableSession);
