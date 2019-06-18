import React, { PureComponent } from 'react';
import Course from '../state/Course';

// Styles
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { List, ListItem, ListItemText, Divider, ListItemIcon } from '@material-ui/core';
import Close from '@material-ui/icons/Close';

const styles = (theme: Theme) => createStyles({
  root: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  listIcon: {
    minWidth: 'initial',
  },
});

export interface Props extends WithStyles<typeof styles> {
  chosen: Course[],
  additional: Course[],
}

class CourseDisplay extends PureComponent<Props> {
  render() {
    const classes = this.props.classes;
    const allCourses = this.props.chosen.concat(this.props.additional);

    return (
      <List className={classes.root} disablePadding>
        {allCourses.map((course, i) => (
          <React.Fragment key={`divider-${i}`}>
            <Divider />
            <ListItem>
              <ListItemText primary={course.code} />
              <ListItemIcon className={classes.listIcon}>
                <Close />
              </ListItemIcon>
            </ListItem>
          </React.Fragment>
        ))}
        <Divider />
      </List>
    )
  }
}

export default withStyles(styles)(CourseDisplay);
