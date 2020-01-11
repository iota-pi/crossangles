import React, { PureComponent, MouseEvent } from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { CBSEvent } from '../state';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import CBSEvents from './CBSEvents';
import WebStream from './WebStream';
import { COURSE_COLOURS, ColourMap, Colour } from '../state/Colours';
import { notNull } from '../typeHelpers';
import ColourPicker from './ColourPicker';
import ColourControl from './Colour';
import { CourseData, CourseId, getCourseId, CBS_CODE, hasWebStream } from '../state/Course';

const styles = (theme: Theme) => createStyles({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  lessSpaceBelow: {
    paddingBottom: theme.spacing(0.5),
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

export interface Props extends WithStyles<typeof styles> {
  cbs: CourseData,
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: CBSEvent[],
  colours: ColourMap,
  webStreams: CourseId[],
  onEditCustomCourse: (course: CourseData) => void,
  onRemoveCourse: (course: CourseData) => void,
  onToggleEvent: (event: CBSEvent) => void,
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
            {course.code !== CBS_CODE ? (
              <CourseDisplay
                {...this.props}
                course={course}
                onShowPopover={this.showPopover}
              />
            ) : (
              <CBSCourseDisplay
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
      <ListItem className={hasWebStream(course) ? classes.lessSpaceBelow : undefined}>
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

export const CBSCourseDisplay = withStyles(styles)(({
  classes,
  course,
  cbs,
  events,
  colours,
  onShowPopover,
  onToggleEvent,
}: CourseProps) => {
  return (
    <React.Fragment>
      <ListItem className={classes.lessSpaceBelow}>
        <ListItemText>
          <span>{course.name}</span>
        </ListItemText>

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
            style={{ visibility: 'hidden' }}
          >
            <Close />
          </IconButton>
        </ListItemIcon>
      </ListItem>

      <ListItem className={classes.noVertPadding}>
        <CBSEvents
          cbs={cbs}
          events={events}
          onToggleEvent={onToggleEvent}
        />
      </ListItem>
    </React.Fragment>
  )
});

export default withStyles(styles)(CourseList);
