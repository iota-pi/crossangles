import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { event } from 'react-ga';

import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Edit from '@material-ui/icons/Edit';
import OpenInNew from '@material-ui/icons/OpenInNew';
import WebStream from './WebStream';
import { CourseActionButton } from './CourseActionButton';
import ColourControl from './Colour';
import {
  Colour, CourseData, CourseId, getCourseId, getClarificationText, getWebStream, Meta,
} from '../state';
import { isUNSW, isUSYD } from '../getCampus';
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
    fontWeight: 300,
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
  clipText: {
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
  colour: Colour,
  onRemoveCourse: (course: CourseData) => void,
  onShowPopover: (event: React.MouseEvent<HTMLElement>, course: CourseData) => void,
}

export interface CourseDisplayProps extends BaseCourseDisplayProps {
  webStreams: CourseId[],
  meta: Meta,
  onEditCustomCourse: (course: CourseData) => void,
  onToggleWeb: (course: CourseData) => void,
}


const getHandbookLink = (course: CourseData, meta: Meta) => {
  if (isUNSW()) {
    return `https://www.handbook.unsw.edu.au/undergraduate/courses/${meta.year}/${course.code}`;
  } else if (isUSYD()) {
    return `https://www.sydney.edu.au/units/${course.code}`;
  }

  return undefined;
};


export const CourseDisplay = ({
  course,
  colour,
  meta,
  webStreams,
  onEditCustomCourse,
  onRemoveCourse,
  onToggleWeb,
  onShowPopover,
}: CourseDisplayProps) => {
  const classes = useStyles();
  const handbookLink = getHandbookLink(course, meta);
  const clarification = getClarificationText(course);
  const courseTitle = (
    <>
      <span>{course.code}</span>
      <span className={classes.lightText}>
        {' — '}
        {course.name}
      </span>
      {clarification && (
        <span className={classes.termText}>
          {' '}
          ({clarification})
        </span>
      )}
    </>
  );
  const webStream = getWebStream(course);

  const handleLinkClick = (destination?: string) => {
    event({
      category: CATEGORY,
      action: 'Handbook Link',
      label: destination,
    });
  };
  const linkProps = {
    href: handbookLink,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => handleLinkClick(handbookLink),
  };

  return (
    <>
      <ListItem>
        {!course.isCustom ? (
          <div className={classes.courseTitle}>
            {handbookLink ? (
              <>
                <a {...linkProps} className={classes.plainLink}>
                  {courseTitle}
                </a>

                <a {...linkProps} className={`${classes.plainLink} ${classes.noShrink}`}>
                  <OpenInNew className={classes.externalLinkIcon} fontSize="inherit" />
                </a>
              </>
            ) : courseTitle}
          </div>
        ) : (
          <div className={classes.courseTitle}>
            <span className={classes.clipText}>
              <span>{course.name}</span>
              <span className={classes.lightText}> (Personal)</span>
            </span>
          </div>
        )}

        {course.isCustom && (
          <IconButton
            size="small"
            className={classes.marginRight}
            onClick={() => onEditCustomCourse(course)}
          >
            <Edit />
          </IconButton>
        )}

        <div className={classes.marginRight}>
          <ColourControl
            colour={colour}
            size={32}
            isCircle
            onClick={e => onShowPopover(e, course)}
          />
        </div>

        <CourseActionButton
          onClick={() => onRemoveCourse(course)}
        >
          <Close />
        </CourseActionButton>
      </ListItem>

      {webStream !== null ? (
        <ListItem className={classes.noVertPadding}>
          <WebStream
            checked={webStreams.includes(getCourseId(course))}
            stream={webStream}
            onChange={() => onToggleWeb(course)}
          />
        </ListItem>
      ) : <></>}
    </>
  );
};

export default CourseDisplay;
