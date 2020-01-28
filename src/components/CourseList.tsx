import React, { PureComponent, MouseEvent } from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { AdditionalEvent } from '../state';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import Expand from '@material-ui/icons/ExpandMore';
import AdditionalEvents from './AdditionalEvents';
import WebStream from './WebStream';
import { COURSE_COLOURS, ColourMap, Colour } from '../state/Colours';
import { notNull } from '../typeHelpers';
import ColourPicker from './ColourPicker';
import ColourControl from './Colour';
import { CourseData, CourseId, getCourseId, hasWebStream } from '../state/Course';
import { Collapse } from '@material-ui/core';

const styles = (theme: Theme) => {
  const transition = {
    duration: theme.transitions.duration.shorter,
  };

  return createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    minimised: {
      '& $expandIcon': {
        transform: 'rotate(180deg)',
      },
    },
    compactSpaceBelow: {
      transition: theme.transitions.create('paddingBottom', transition),
      ':not(&$minimised)': {
        paddingBottom: theme.spacing(0.5),
      },
    },
    expandIcon: {
      transform: 'rotate(0deg)',
      transition: theme.transitions.create('transform', transition),
    },
    noVertPadding: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    listIcon: {
      minWidth: 'initial',
    },
    lightText: {
      fontWeight: 300,
    },
    termText: {
      fontWeight: 400,
    },
    marginRight: {
      marginRight: theme.spacing(1),
    },
  });
};

export interface Props extends WithStyles<typeof styles> {
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: AdditionalEvent[],
  colours: ColourMap,
  webStreams: CourseId[],
  hiddenEvents: CourseId[],
  onEditCustomCourse: (course: CourseData) => void,
  onRemoveCourse: (course: CourseData) => void,
  onToggleShowEvents: (course: CourseData) => void,
  onToggleEvent: (event: AdditionalEvent) => void,
  onToggleWeb: (course: CourseData) => void,
  onColourChange: (course: CourseData, colour: Colour) => void,
}

export interface State {
  showPopover: PopoverState | null,
}

export interface PopoverState {
  target: HTMLElement,
  course: CourseData,
}


class CourseList extends PureComponent<Props, State> {
  state: State = {
    showPopover: null,
  }

  render() {
    const classes = this.props.classes;
    const allCourses = this.props.chosen.concat(this.props.custom, this.props.additional);

    return (
      <List className={classes.root} disablePadding id="course-display">
        {allCourses.map((course, i) => (
          <React.Fragment key={getCourseId(course)}>
            <Divider light />
            {!course.isAdditional ? (
              <CourseDisplay
                {...this.props}
                course={course}
                onShowPopover={this.showPopover}
              />
            ) : (
              <AdditionalCourseDisplay
                {...this.props}
                course={course}
                onShowPopover={this.showPopover}
              />
            )}
          </React.Fragment>
        ))}
        <Divider light />

        <Popover
          open={this.state.showPopover !== null}
          anchorEl={this.state.showPopover ? this.state.showPopover.target : null}
          onClose={this.hidePopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <ColourPicker
            colours={COURSE_COLOURS}
            value={this.state.showPopover ? this.props.colours[getCourseId(this.state.showPopover.course)] : null}
            onChange={this.handleChange}
            size={40}
            columns={4}
          />
        </Popover>
      </List>
    )
  }

  private showPopover = (event: MouseEvent<HTMLElement>, course: CourseData) => {
    this.setState({
      showPopover: {
        target: event.currentTarget,
        course,
      },
    });
  }

  private hidePopover = () => {
    this.setState({ showPopover: null });
  }

  private handleChange = (colour: Colour) => {
    this.props.onColourChange(notNull(this.state.showPopover).course, colour);
    this.hidePopover();
  }
}


export interface CourseProps extends Props {
  course: CourseData,
  onShowPopover: (event: MouseEvent<HTMLElement>, course: CourseData) => void,
}

export const CourseDisplay = withStyles(styles)(({
  classes,
  course,
  colours,
  webStreams,
  onEditCustomCourse,
  onRemoveCourse,
  onToggleWeb,
  onShowPopover,
}: CourseProps) => {
  return (
    <React.Fragment>
      <ListItem className={hasWebStream(course) ? classes.compactSpaceBelow : undefined}>
        {!course.isCustom ? (
          <ListItemText>
            <span>{course.code}</span>
            <span className={classes.lightText}> — {course.name}</span>
            {course.term ? (
              <span className={classes.termText}> ({course.term})</span>
            ) : null}
          </ListItemText>
        ) : (
          <ListItemText>
            <span>{course.name}</span>
            <span className={classes.lightText}> (Personal)</span>
          </ListItemText>
        )}

        {course.isCustom && (
          <IconButton
            size="small"
            className={classes.marginRight}
            onClick={() => onEditCustomCourse(course)}
            data-cy="edit-custom"
          >
            <Edit />
          </IconButton>
        )}

        <div className={classes.marginRight}>
          <ColourControl
            colour={colours[getCourseId(course)]!}
            size={32}
            isCircle
            onClick={e => onShowPopover(e, course)}
          />
        </div>

        <ListItemIcon
          className={classes.listIcon}
        >
          <IconButton
            size="small"
            onClick={() => onRemoveCourse(course)}
            data-cy="remove-course"
          >
            <Close />
          </IconButton>
        </ListItemIcon>
      </ListItem>

      {hasWebStream(course) ? (
        <ListItem className={classes.noVertPadding}>
          <WebStream
            checked={webStreams.includes(getCourseId(course))}
            onChange={() => onToggleWeb(course)}
          />
        </ListItem>
      ) : <React.Fragment/>}
    </React.Fragment>
  )
});

export const AdditionalCourseDisplay = withStyles(styles)(({
  classes,
  course,
  events,
  colours,
  hiddenEvents,
  onShowPopover,
  onToggleEvent,
  onRemoveCourse,
  onToggleShowEvents,
}: CourseProps) => {
  const components = course.streams.map(s => s.component);
  const eventList = components.filter((c, i) => components.indexOf(c) === i);

  const courseId = getCourseId(course);
  const minimiseEvents = hiddenEvents.includes(courseId);
  const showEvents = eventList.length > 1 || course.autoSelect;
  const colour = colours[courseId];

  const rootClasses = [classes.compactSpaceBelow];
  if (minimiseEvents) {
    rootClasses.push(classes.minimised);
  }

  return (
    <React.Fragment>
      <ListItem className={rootClasses.join(' ')}>
        <ListItemText>
          <span>{course.name}</span>
        </ListItemText>

        <div className={classes.marginRight}>
          <ColourControl
            colour={colour}
            size={32}
            isCircle
            onClick={e => onShowPopover(e, course)}
          />
        </div>

        <CourseAction
          classes={classes}
          course={course}
          onRemoveCourse={onRemoveCourse}
          onToggleShowEvents={onToggleShowEvents}
        />
      </ListItem>

      {showEvents && (
        <Collapse in={!minimiseEvents}>
          <ListItem className={classes.noVertPadding}>
            <AdditionalEvents
              course={course}
              events={events}
              onToggleEvent={onToggleEvent}
            />
          </ListItem>
        </Collapse>
      )}
    </React.Fragment>
  )
});

interface CourseActionProps extends WithStyles<typeof styles> {
  course: CourseData,
  onRemoveCourse: (course: CourseData) => void,
  onToggleShowEvents: (course: CourseData) => void,
}

const CourseAction = ({
  classes,
  course,
  onToggleShowEvents,
  onRemoveCourse,
}: CourseActionProps) => (course.isAdditional && course.autoSelect) ? (
  <ListItemIcon
    className={classes.listIcon}
  >
    <IconButton
      size="small"
      onClick={() => onToggleShowEvents(course)}
      data-cy="hide-events"
      className={classes.expandIcon}
    >
      <Expand />
    </IconButton>
  </ListItemIcon>
) : (
  <ListItemIcon
    className={classes.listIcon}
  >
    <IconButton
      size="small"
      onClick={() => onRemoveCourse(course)}
      data-cy="remove-course"
    >
      <Close />
    </IconButton>
  </ListItemIcon>
);

export default withStyles(styles)(CourseList);
