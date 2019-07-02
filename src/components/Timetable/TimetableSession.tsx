import React, { PureComponent, CSSProperties } from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { MappedSession, CBS_CODE, Course, Stream } from '../../state';
import { Dimensions } from './timetableTypes';
import { TIMETABLE_FIRST_CELL_WIDTH, TIMETABLE_CELL_HEIGHT } from '.';
import Draggable from 'react-draggable';

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
    zIndex: 1,

    transition: 'box-shadow 0.3s, left 0.3s, top 0.3s',

    '&$dragging': {
      cursor: 'grabbing',
      transition: 'box-shadow 0.3s',
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
  dragging: {},
  new: {},
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
  session: MappedSession,
  timetableDimensions: Dimensions,
  firstHour: number,
  color: string,
}

class TimetableSession extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;

    return (
      <Draggable
        axis="both"
        bounds="parent"
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}
      >
        <div className={classes.root} style={this.styles}>
          <div
            className={classes.background}
            style={{
              backgroundColor: this.props.color,
            }}
          />

          <div className={classes.sessionText}>
            <div className={classes.label}>
              <span className={classes.em}>{this.sessionTitle}</span>
              <span>{this.sessionComponent}</span>
            </div>

            {this.details.map((detail, i) => (
              <div className={classes.details} key={`detail-${i}`}>
                {detail}
              </div>
            ))}
          </div>
        </div>
      </Draggable>
    )
  }

  private handleStart = () => {
    console.log('drag start');
  }

  private handleDrag = () => {
    console.log('dragging');
  }

  private handleStop = () => {
    console.log('drag Stop');
  }

  private get course (): Course {
    return this.props.session.course;
  }

  private get stream (): Stream {
    return this.props.session.stream;
  }

  private get duration (): number {
    return this.props.session.end - this.props.session.start;
  }

  private get basePosition () {
    const dayIndex = ['M', 'T', 'W', 'H', 'F'].indexOf(this.props.session.day);
    return {
      // +2px for the borders of the first cell in row
      left: Math.round(TIMETABLE_FIRST_CELL_WIDTH + (this.width + 1) * dayIndex) + 2,
      // +1px for top border
      top: (TIMETABLE_CELL_HEIGHT) * (1 + this.props.session.start - this.props.firstHour) + 1,
    }
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

  private get width (): number {
    return Math.floor((this.props.timetableDimensions.w - TIMETABLE_FIRST_CELL_WIDTH - 7) / 5);
  }

  private get styles (): CSSProperties {
    return {
      width: this.width,
      height: this.duration * TIMETABLE_CELL_HEIGHT - 1,
      ...this.basePosition,
    };
  }
}

export default withStyles(styles)(TimetableSession);
