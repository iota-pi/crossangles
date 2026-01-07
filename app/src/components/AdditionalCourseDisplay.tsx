import makeStyles from '@material-ui/core/styles/makeStyles'
import { event } from 'react-ga'

import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import Expand from '@material-ui/icons/ExpandMore'
import Close from '@material-ui/icons/Close'
import OpenInNew from '@material-ui/icons/OpenInNew'
import { AdditionalEvents } from './AdditionalEvents'
import ColourControl from './Colour'
import {
  getCourseId,
  CourseData,
  CourseId,
  getEvents,
  AdditionalEvent,
  Colour,
} from '../state'
import { CATEGORY } from '../analytics'
import { CourseActionButton } from './CourseActionButton'
import { BaseCourseDisplayProps } from './CourseDisplay'
import { memo, useCallback } from 'react'

export interface AdditionalCourseDisplayProps extends BaseCourseDisplayProps {
  course: CourseData,
  events: AdditionalEvent[],
  colour: Colour,
  hiddenEvents: CourseId[],
  onToggleEvent: (event: AdditionalEvent) => void,
  onRemoveCourse: (course: CourseData) => void,
  onToggleShowEvents: (course: CourseData) => void,
  onShowPopover: (event: React.MouseEvent<HTMLElement>, course: CourseData) => void,
}


const useStyles = makeStyles(theme => ({
  noVertPadding: {
    marginTop: -theme.spacing(0.5),
    paddingTop: 0,
    paddingBottom: 0,
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
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  clipText: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
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
}))

const AdditionalCourseDisplayComponent: React.FC<AdditionalCourseDisplayProps> = ({
  course,
  events,
  colour,
  hiddenEvents,
  onShowPopover,
  onToggleEvent,
  onRemoveCourse,
  onToggleShowEvents,
}: AdditionalCourseDisplayProps) => {
  const classes = useStyles()
  const eventList = getEvents(course)

  const courseId = getCourseId(course)
  const minimiseEvents = hiddenEvents.includes(courseId)
  const showEvents = eventList.length > 1 || course.autoSelect
  const website = course.metadata ? course.metadata.website : undefined

  const handleLinkClick = useCallback(
    () => {
      event({
        category: CATEGORY,
        action: 'Additional Link',
        label: website,
      })
    },
    [website],
  )
  const handleActionClick = useCallback(
    () => (course.autoSelect ? onToggleShowEvents(course) : onRemoveCourse(course)),
    [course, onToggleShowEvents, onRemoveCourse],
  )
  const handleColourClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => onShowPopover(e, course),
    [course, onShowPopover],
  )

  return (
    <>
      <ListItem>
        <div className={classes.courseTitle}>
          {course.metadata ? (
            <>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className={classes.plainLink}
              >
                <span>{course.name}</span>
              </a>

              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className={`${classes.plainLink} ${classes.noShrink}`}
                aria-hidden
              >
                <OpenInNew className={classes.externalLinkIcon} fontSize="inherit" />
              </a>
            </>
          ) : (
            <span className={classes.clipText}>{course.name}</span>
          )}
        </div>

        <div className={classes.marginRight}>
          <ColourControl
            colour={colour}
            size={32}
            isCircle
            onClick={handleColourClick}
          />
        </div>

        <CourseActionButton
          onClick={handleActionClick}
          flipped={minimiseEvents}
        >
          {course.autoSelect ? (
            <Expand />
          ) : (
            <Close />
          )}
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
    </>
  )
}

export const AdditionalCourseDisplay = memo(AdditionalCourseDisplayComponent)
export default AdditionalCourseDisplay
