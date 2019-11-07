import React, { PureComponent, MouseEvent } from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Course, CBS_CODE, CBSEvent, CourseId, CustomCourse } from '../state';
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
import { COURSE_COLOURS } from '../state/colours';
import { notNull } from '../typeHelpers';
import ColourPicker from './ColourPicker';
import Colour from './Colour';

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
  chosen: Course[],
  custom: CustomCourse[],
  additional: Course[],
  events: CBSEvent[],
  colours: Map<CourseId, string>,
  onEditCustomCourse: (course: Course) => void,
  onRemoveCourse: (course: Course) => void,
  onToggleEvent: (event: CBSEvent) => void,
  onToggleWeb: (course: Course) => void,
  onColourChange: (course: Course, colour: string) => void,
}

export interface State {
  showPopover: PopoverState | null,
}

export interface PopoverState {
  target: HTMLElement,
  course: Course,
}

class CourseDisplay extends PureComponent<Props, State> {
  state: State = {
    showPopover: null,
  }

  render() {
    const classes = this.props.classes;
    const allCourses = this.props.chosen.concat(this.props.custom, this.props.additional);

    return (
      <List className={classes.root} disablePadding>
        {allCourses.map((course, i) => (
          <React.Fragment key={course.id}>
            <Divider light />
            {course.code !== CBS_CODE ? (
              <React.Fragment>
                <ListItem className={course.hasWebStream ? classes.lessSpaceBelow : undefined}>
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
                      onClick={() => this.props.onEditCustomCourse(course)}
                    >
                      <Edit />
                    </IconButton>
                  )}

                  <div className={classes.marginRight}>
                    <Colour
                      colour={this.props.colours.get(course.id)!}
                      size={32}
                      isCircle
                      onClick={e => this.showPopover(e, course)}
                    />
                  </div>

                  <ListItemIcon
                    className={classes.listIcon}
                  >
                    <IconButton
                      size="small"
                      onClick={() => this.props.onRemoveCourse(course)}
                    >
                      <Close />
                    </IconButton>
                  </ListItemIcon>
                </ListItem>

                {course.hasWebStream ? (
                  <ListItem className={classes.noVertPadding}>
                    <WebStream
                      checked={course.useWebStream}
                      onChange={() => this.props.onToggleWeb(course)}
                    />
                  </ListItem>
                ) : <React.Fragment/>}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <ListItem className={classes.lessSpaceBelow}>
                  <ListItemText>
                    <span>{course.name}</span>
                  </ListItemText>

                  <div className={classes.marginRight}>
                    <Colour
                      colour={this.props.colours.get(course.id)!}
                      size={32}
                      isCircle
                      onClick={e => this.showPopover(e, course)}
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
                    events={this.props.events}
                    onToggleEvent={this.props.onToggleEvent}
                  />
                </ListItem>
              </React.Fragment>
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
            value={this.state.showPopover ? this.props.colours.get(this.state.showPopover.course.id) : null}
            onChange={this.handleChange}
            size={40}
            columns={4}
          />
        </Popover>
      </List>
    )
  }

  private showPopover = (event: MouseEvent<HTMLElement>, course: Course) => {
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

  private handleChange = (colour: string) => {
    this.props.onColourChange(notNull(this.state.showPopover).course, colour);
    this.hidePopover();
  }
}

export default withStyles(styles)(CourseDisplay);
