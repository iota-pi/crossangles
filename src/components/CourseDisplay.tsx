import React, { MouseEvent } from 'react';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import Expand from '@material-ui/icons/ExpandMore';
import OpenInNew from '@material-ui/icons/OpenInNew';
import AdditionalEvents from './AdditionalEvents';
import WebStream from './WebStream';
import { ColourMap } from '../state/Colours';
import ColourControl from './Colour';
import { CourseData, CourseId, getCourseId, hasWebStream } from '../state/Course';
import { Collapse } from '@material-ui/core';
import { getEvents, AdditionalEvent } from '../state/Events';
import { Meta } from '../state/Meta';
import getCampus from '../getCampus';


const styles = (theme: Theme) => {
  const transition = {
    duration: theme.transitions.duration.shorter,
  };

  return createStyles({
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
    plainLink: {
      textDecoration: 'none',
      color: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
    },
    externalLinkIcon: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      color: 'rgba(0, 0, 0, 0.3)',
      verticalAlign: 'baseline',
    },
    marginRight: {
      marginRight: theme.spacing(1),
    },
    description: {
      color: 'rgb(0, 0, 238)',
      fontWeight: 300,
      fontSize: '0.7rem',
      marginLeft: theme.spacing(1),
      cursor: 'pointer',
    },
  });
};


export interface BaseCourseDisplayProps extends WithStyles<typeof styles> {
  course: CourseData,
  colours: ColourMap,
  onRemoveCourse: (course: CourseData) => void,
  onShowPopover: (event: MouseEvent<HTMLElement>, course: CourseData) => void,
}

export interface CourseDisplayProps extends BaseCourseDisplayProps {
  webStreams: CourseId[],
  meta: Meta,
  onEditCustomCourse: (course: CourseData) => void,
  onToggleWeb: (course: CourseData) => void,
}

export interface AdditionalCourseDisplayProps extends BaseCourseDisplayProps {
  course: CourseData,
  events: AdditionalEvent[],
  colours: ColourMap,
  hiddenEvents: CourseId[],
  onToggleEvent: (event: AdditionalEvent) => void,
  onRemoveCourse: (course: CourseData) => void,
  onToggleShowEvents: (course: CourseData) => void,
  onShowPopover: (event: MouseEvent<HTMLElement>, course: CourseData) => void,
}


const getHandbookLink = (course: CourseData, meta: Meta) => {
  const campus = getCampus(window.location.hostname);
  if (campus === 'unsw') {
    return `https://www.handbook.unsw.edu.au/undergraduate/courses/${meta.year}/${course.code}`;
  }

  return null;
}


export const CourseDisplay = withStyles(styles)(({
  classes,
  course,
  colours,
  webStreams,
  meta,
  onEditCustomCourse,
  onRemoveCourse,
  onToggleWeb,
  onShowPopover,
}: CourseDisplayProps) => {
  const handbookLink = getHandbookLink(course, meta);
  const courseTitle = (
    <>
      <span>{course.code}</span>
      <span className={classes.lightText}> — {course.name}</span>
      {course.term ? (
        <span className={classes.termText}> ({course.term})</span>
      ) : null}
    </>
  );

  return (
    <React.Fragment>
      <ListItem className={hasWebStream(course) ? classes.compactSpaceBelow : undefined}>
        {!course.isCustom ? (
          <ListItemText>
            {handbookLink ? (
              <a
                href={handbookLink}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.plainLink}
              >
                {courseTitle}
                <OpenInNew className={classes.externalLinkIcon} fontSize={'inherit'} />
              </a>
            ) : courseTitle}
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
}: AdditionalCourseDisplayProps) => {
  const eventList = getEvents(course);

  const courseId = getCourseId(course);
  const minimiseEvents = hiddenEvents.includes(courseId);
  const showEvents = eventList.length > 1 || course.autoSelect;
  const colour = colours[courseId];

  const rootClasses = [classes.compactSpaceBelow];
  if (minimiseEvents) {
    rootClasses.push(classes.minimised);
  }

  const courseLabel = course.metadata ? (
    <a
      href={course.metadata.website}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.plainLink}
    >
      <span>{course.name}</span>
      <OpenInNew className={classes.externalLinkIcon} fontSize={'inherit'} />
    </a>
  ) : (
    <span>{course.name}</span>
  );

  return (
    <React.Fragment>
      <ListItem className={rootClasses.join(' ')}>
        <ListItemText>
          {course.description ? (
            <Tooltip
              title={course.description}
              aria-hidden="true"
              // placement="right"
            >
              {courseLabel}
            </Tooltip>
          ) : courseLabel}
        </ListItemText>

        <div className={classes.marginRight}>
          <ColourControl
            colour={colour}
            size={32}
            isCircle
            onClick={e => onShowPopover(e, course)}
          />
        </div>

        <CourseActionButton
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

interface CourseActionButtonProps extends WithStyles<typeof styles> {
  course: CourseData,
  onRemoveCourse: (course: CourseData) => void,
  onToggleShowEvents: (course: CourseData) => void,
}

const CourseActionButton = ({
  classes,
  course,
  onToggleShowEvents,
  onRemoveCourse,
}: CourseActionButtonProps) => (course.isAdditional && course.autoSelect) ? (
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

export default CourseDisplay;
