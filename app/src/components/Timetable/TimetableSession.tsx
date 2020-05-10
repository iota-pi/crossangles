import React, { PureComponent, CSSProperties } from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { TransitionGroup } from 'react-transition-group';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import Fade from '@material-ui/core/Fade';
import Collapse from '@material-ui/core/Collapse';
import { Position, Dimensions } from './timetableTypes';
import {
  CourseData,
  Options,
  StreamData,
  LinkedSession,
} from '../../state';

const styles = (theme: Theme) => createStyles({
  main: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
    cursor: 'grab',
    overflow: 'hidden',

    transition: theme.transitions.create(['box-shadow', 'transform']),
    boxShadow: theme.shadows[3],

    '&$snapped:not($hovering)': {
      boxShadow: theme.shadows[0],
    },

    '&$dragging': {
      cursor: 'grabbing',
      transition: theme.transitions.create(['box-shadow']),
      boxShadow: theme.shadows[8],
    },
  },
  background: {
    transition: theme.transitions.create(['background-color']),
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
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
  session: LinkedSession,
  colour: string,
  dimensions: Dimensions,
  position: Required<Position>,
  isDragging: boolean,
  isSnapped: boolean,
  clashDepth: number,
  options: Options,
  onDrag: (session: LinkedSession) => false | void,
  onMove: (session: LinkedSession, delta: Position) => void,
  onDrop: (session: LinkedSession) => void,
}

type Detail = { key: string, text: string };


class TimetableSession extends PureComponent<Props> {
  render() {
    const { classes, session } = this.props;
    const rootClasses = [
      classes.main,
      this.props.isDragging ? classes.dragging : '',
      this.props.isSnapped ? classes.snapped : '',
      this.props.clashDepth > 0 ? classes.hovering : '',
    ].join(' ');
    const { course, stream, day, start, end } = session;

    return (
      <DraggableCore
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}
      >
        <div
          className={rootClasses}
          style={this.styles}
          data-cy="timetable-session"
          data-session={`${course.code}-${stream.component}-${day}${start}-${end}`}
          data-snapped={+this.props.isSnapped}
          data-dragging={+this.props.isDragging}
        >
          <div
            className={classes.background}
            style={{
              backgroundColor: this.props.colour,
            }}
            data-cy="timetable-session-background"
          />

          <div className={classes.sessionText}>
            <div className={classes.label}>
              <span className={classes.em}>{this.sessionTitle} </span>
              <span>{this.sessionComponent}</span>
            </div>

            <Fade in={this.props.isSnapped} appear={false}>
              <div>
                <TransitionGroup appear={false}>
                  {this.details.map((detail, i) => (
                    <Collapse key={detail.key}>
                      <div className={classes.details}>
                        {detail.text}
                      </div>
                    </Collapse>
                  ))}
                </TransitionGroup>
              </div>
            </Fade>
          </div>
        </div>
      </DraggableCore>
    )
  }

  private handleStart = (e: DraggableEvent) => {
    this.props.onDrag(this.props.session);
  }

  private handleDrag = (e: DraggableEvent, data: DraggableData) => {
    if (this.props.isDragging) {
      let x = data.deltaX;
      let y = data.deltaY;
      this.props.onMove(this.props.session, { x, y });
    }
  }

  private handleStop = () => {
    return this.props.onDrop(this.props.session);
  }

  private get course (): CourseData {
    return this.props.session.course;
  }

  private get stream (): StreamData {
    return this.props.session.stream;
  }

  private get isSpecialCourse (): boolean {
    return this.course.isAdditional || this.course.isCustom || false;
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

  private get details (): Detail[] {
    const details: Detail[] = [];

    if (this.props.options.showLocations) {
      const location = this.props.session.location;
      if (location) {
        details.push({ key: 'location-enrols', text: location});
      }
    }

    if (this.props.options.showEnrolments) {
      const enrols = this.stream.enrols;
      if (enrols[1] > 0) {
        const enrolsText = enrols.join('/');
        if (details.length > 0) {
          details[0].text += ` (${enrolsText})`;
        } else {
          details.push({ key: 'location-enrols', text: enrolsText });
        }
      }
    }

    if (this.props.options.showWeeks) {
      const weeks = this.props.session.weeks;
      if (weeks) {
        const weeksText = 'Weeks: ' + weeks.replace('-', '–');
        details.push({ key: 'weeks', text: weeksText });
      }
    }

    return details;
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
