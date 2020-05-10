import React, { PureComponent, MouseEvent } from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Popover from '@material-ui/core/Popover';
import CourseDisplay from './CourseDisplay';
import AdditionalCourseDisplay from './AdditionalCourseDisplay';
import ColourPicker from './ColourPicker';
import {
  COURSE_COLOURS,
  ColourMap,
  Colour,
  CourseData,
  CourseId,
  getCourseId,
  Meta,
  Options,
  AdditionalEvent,
} from '../state';
import { notNull } from '../typeHelpers';

const styles = (theme: Theme) => createStyles({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
});

export interface Props extends WithStyles<typeof styles> {
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: AdditionalEvent[],
  colours: ColourMap,
  webStreams: CourseId[],
  hiddenEvents: CourseId[],
  meta: Meta,
  options: Options,
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
                course={course}
                colours={this.props.colours}
                webStreams={this.props.webStreams}
                meta={this.props.meta}
                includeFull={this.props.options.includeFull || false}
                onToggleWeb={this.props.onToggleWeb}
                onRemoveCourse={this.props.onRemoveCourse}
                onEditCustomCourse={this.props.onEditCustomCourse}
                onShowPopover={this.showPopover}
              />
            ) : (
              <AdditionalCourseDisplay
                course={course}
                events={this.props.events}
                colours={this.props.colours}
                hiddenEvents={this.props.hiddenEvents}
                onToggleEvent={this.props.onToggleEvent}
                onToggleShowEvents={this.props.onToggleShowEvents}
                onRemoveCourse={this.props.onRemoveCourse}
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
            size={40}
            columns={4}
            onChange={this.handleChange}
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

export default withStyles(styles)(CourseList);
