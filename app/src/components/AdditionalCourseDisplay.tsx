import React, { MouseEvent } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ReactGA from 'react-ga';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Expand from '@material-ui/icons/ExpandMore';
import Close from '@material-ui/icons/Close';
import OpenInNew from '@material-ui/icons/OpenInNew';
import AdditionalEvents from './AdditionalEvents';
import ColourControl from './Colour';
import { getCourseId, CourseData, CourseId } from '../state/Course';
import { Collapse } from '@material-ui/core';
import { getEvents, AdditionalEvent } from '../state/Events';
import { CATEGORY } from '../analytics';
import CourseActionButton from './CourseActionButton';
import { BaseCourseDisplayProps } from './CourseDisplay';
import { ColourMap } from '../state/Colours';

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


const useStyles = makeStyles(theme => ({
  noVertPadding: {
    marginTop: -theme.spacing(0.5),
    paddingTop: 0,
    paddingBottom: 0,
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
    color: theme.palette.text.disabled,
    verticalAlign: 'baseline',
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
}));

export const AdditionalCourseDisplay = ({
  course,
  events,
  colours,
  hiddenEvents,
  onShowPopover,
  onToggleEvent,
  onRemoveCourse,
  onToggleShowEvents,
}: AdditionalCourseDisplayProps) => {
  const classes = useStyles();
  const eventList = getEvents(course);

  const courseId = getCourseId(course);
  const minimiseEvents = hiddenEvents.includes(courseId);
  const showEvents = eventList.length > 1 || course.autoSelect;
  const colour = colours[courseId];

  const handleLinkClick = (destination?: string) => {
    ReactGA.event({
      category: CATEGORY,
      action: 'Additional Link',
      label: destination,
    });
  }

  return (
    <React.Fragment>
      <ListItem>
        <ListItemText>
          {course.metadata ? (
            <a
              href={course.metadata.website}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.plainLink}
              onClick={() => handleLinkClick(course.metadata!.website)}
            >
              <span>{course.name}</span>
              <OpenInNew className={classes.externalLinkIcon} fontSize={'inherit'} />
            </a>
          ) : (
            <span>{course.name}</span>
          )}
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
          onClick={() => course.autoSelect ? onToggleShowEvents(course) : onRemoveCourse(course)}
          data-cy={course.autoSelect ? 'hide-events' : 'remove-course'}
          flipped={minimiseEvents}
        >
          {course.autoSelect ? <Expand /> : <Close />}
        </CourseActionButton>
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
};

export default AdditionalCourseDisplay;
