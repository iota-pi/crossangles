import React, { PureComponent } from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Course, CBS_CODE, CBSEvent } from '../state';
import { List, ListItem, ListItemText, Divider, ListItemIcon, IconButton } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import CBSEvents from './CBSEvents';
import WebStream from './WebStream';

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
});

export interface Props extends WithStyles<typeof styles> {
  chosen: Course[],
  additional: Course[],
  events: CBSEvent[],
  onRemoveCourse: (course: Course) => void,
  onToggleEvent: (event: CBSEvent) => void,
  onToggleWeb: (course: Course) => void,
}

class CourseDisplay extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;
    const allCourses = this.props.chosen.concat(this.props.additional);

    return (
      <List className={classes.root} disablePadding>
        {allCourses.map((course, i) => (
          <React.Fragment key={`divider-${i}`}>
            <Divider light />
            {course.code !== CBS_CODE ? (
              <React.Fragment>
                <ListItem className={course.hasWebStream ? classes.lessSpaceBelow : undefined}>
                  <ListItemText>
                    <span>{course.code}</span>
                    <span className={classes.lightText}> — {course.name}</span>
                  </ListItemText>

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
      </List>
    )
  }
}

export default withStyles(styles)(CourseDisplay);
