import React, { MouseEvent } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ReactGA from 'react-ga';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import OpenInNew from '@material-ui/icons/OpenInNew';
import WebStream from './WebStream';
import CourseActionButton from './CourseActionButton';
import ColourControl from './Colour';
import { ColourMap, CourseData, CourseId, getCourseId, getWebStream, Meta } from '../state';
import getCampus from '../getCampus';
import { CATEGORY } from '../analytics';


const useStyles = makeStyles(theme => ({
  noVertPadding: {
    marginTop: -theme.spacing(0.5),
    paddingTop: 0,
    paddingBottom: 0,
  },
  lightText: {
    fontWeight: 300,
    whiteSpace: 'pre',
  },
  termText: {
    fontWeight: 400,
  },
  courseTitle: {
    display: 'flex',
    flexGrow: 1,
    ...theme.typography.body1,
    overflow: 'hidden',
    paddingRight: theme.spacing(1),
  },
  plainLink: {
    textDecoration: 'none',
    color: 'inherit',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  noShrink: {
    flexShrink: 0,
  },
  externalLinkIcon: {
    marginBottom: -2,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.text.disabled,
    verticalAlign: 'baseline',
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
}));


export interface BaseCourseDisplayProps {
  course: CourseData,
  colours: ColourMap,
  onRemoveCourse: (course: CourseData) => void,
  onShowPopover: (event: MouseEvent<HTMLElement>, course: CourseData) => void,
}

export interface CourseDisplayProps extends BaseCourseDisplayProps {
  webStreams: CourseId[],
  meta: Meta,
  includeFull: boolean,
  onEditCustomCourse: (course: CourseData) => void,
  onToggleWeb: (course: CourseData) => void,
}


const getHandbookLink = (course: CourseData, meta: Meta) => {
  const campus = getCampus();
  if (campus === 'unsw') {
    return `https://www.handbook.unsw.edu.au/undergraduate/courses/${meta.year}/${course.code}`;
  }

  return undefined;
}


export const CourseDisplay = ({
  course,
  colours,
  meta,
  webStreams,
  includeFull,
  onEditCustomCourse,
  onRemoveCourse,
  onToggleWeb,
  onShowPopover,
}: CourseDisplayProps) => {
  const classes = useStyles();
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
  const webStream = getWebStream(course);
  const linkProps = {
    href: handbookLink,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => handleLinkClick(handbookLink),
  };

  const handleLinkClick = (destination?: string) => {
    ReactGA.event({
      category: CATEGORY,
      action: 'Handbook Link',
      label: destination,
    });
  }

  return (
    <React.Fragment>
      <ListItem>
        {!course.isCustom ? (
          <div className={classes.courseTitle}>
            {handbookLink ? (
              <React.Fragment>
                <a {...linkProps} className={classes.plainLink}>
                  {courseTitle}
                </a>

                <a {...linkProps} className={`${classes.plainLink} ${classes.noShrink}`}>
                  <OpenInNew className={classes.externalLinkIcon} fontSize={'inherit'} />
                </a>
              </React.Fragment>
            ) : courseTitle}
          </div>
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
          >
            <Edit data-cy="edit-custom" />
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

        <CourseActionButton
          onClick={() => onRemoveCourse(course)}
        >
          <Close data-cy="remove-course" />
        </CourseActionButton>
      </ListItem>

      {webStream !== null ? (
        <ListItem className={classes.noVertPadding}>
          <WebStream
            checked={webStreams.includes(getCourseId(course))}
            stream={webStream}
            includeFull={includeFull}
            onChange={() => onToggleWeb(course)}
          />
        </ListItem>
      ) : <React.Fragment/>}
    </React.Fragment>
  )
};

export default CourseDisplay;
