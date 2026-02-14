import { TransitionGroup } from 'react-transition-group'
import { makeStyles } from 'tss-react/mui'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import { Collapse } from '@mui/material'
import { useSelector } from 'react-redux'
import { CourseDisplay } from './CourseDisplay'
import { AdditionalCourseDisplay } from './AdditionalCourseDisplay'
import { ColourPicker } from './ColourPicker'
import {
  COURSE_COLOURS,
  ColourMap,
  Colour,
  CourseData,
  CourseId,
  getCourseId,
  Meta,
  AdditionalEvent,
  RootState,
} from '../state'
import { FC, memo, MouseEvent, useCallback, useMemo, useState } from 'react'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
}))

export interface Props {
  chosen: CourseData[],
  custom: CourseData[],
  additional: CourseData[],
  events: AdditionalEvent[],
  colours: ColourMap,
  webStreams: CourseId[],
  hiddenEvents: CourseId[],
  meta: Meta,
  onEditCustomCourse: (course: CourseData) => void,
  onRemoveCourse: (course: CourseData) => void,
  onToggleShowEvents: (course: CourseData) => void,
  onToggleEvent: (event: AdditionalEvent) => void,
  onToggleWeb: (course: CourseData) => void,
  onColourChange: (course: CourseData, colour: Colour) => void,
}

export interface PopoverState {
  target: HTMLElement,
  course: CourseData,
}

const CourseListComponent: FC<Props> = (props: Props) => {
  const { classes } = useStyles()
  const [showPopover, setShowPopover] = useState<PopoverState>()
  const reducedMotion = useSelector((state: RootState) => state.options.reducedMotion)
  const { chosen, custom, additional, onColourChange } = props
  const allCourses = useMemo(
    () => [...chosen, ...custom, ...additional],
    [chosen, custom, additional],
  )

  const handleShowPopover = useCallback(
    (event: MouseEvent<HTMLElement>, course: CourseData) => {
      setShowPopover({
        target: event.currentTarget,
        course,
      })
    },
    [],
  )

  const handleHidePopover = useCallback(
    () => {
      setShowPopover(undefined)
    },
    [],
  )

  const handleChange = useCallback(
    (colour: Colour) => {
      onColourChange(showPopover!.course, colour)
      handleHidePopover()
    },
    [showPopover, handleHidePopover, onColourChange],
  )

  return (
    <List className={classes.root} disablePadding id="course-display">
      <TransitionGroup>
        {allCourses.map(course => (
          <Collapse
            key={getCourseId(course)}
            enter={!reducedMotion}
            exit={!reducedMotion}
          >
            <div>
              <Divider light />
              {!course.isAdditional ? (
                <CourseDisplay
                  course={course}
                  colour={props.colours[getCourseId(course)]}
                  webStreams={props.webStreams}
                  meta={props.meta}
                  onToggleWeb={props.onToggleWeb}
                  onRemoveCourse={props.onRemoveCourse}
                  onEditCustomCourse={props.onEditCustomCourse}
                  onShowPopover={handleShowPopover}
                />
              ) : (
                <AdditionalCourseDisplay
                  course={course}
                  events={props.events}
                  colour={props.colours[getCourseId(course)]}
                  hiddenEvents={props.hiddenEvents}
                  onToggleEvent={props.onToggleEvent}
                  onToggleShowEvents={props.onToggleShowEvents}
                  onRemoveCourse={props.onRemoveCourse}
                  onShowPopover={handleShowPopover}
                />
              )}
            </div>
          </Collapse>
        ))}
      </TransitionGroup>

      <Popover
        open={showPopover !== undefined}
        anchorEl={showPopover ? showPopover.target : undefined}
        onClose={handleHidePopover}
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
          value={showPopover ? props.colours[getCourseId(showPopover.course)] : undefined}
          size={40}
          columns={4}
          onChange={handleChange}
        />
      </Popover>
    </List>
  )
}
export const CourseList = memo(CourseListComponent)
export default CourseList
