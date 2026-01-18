import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { AdditionalEvent, CourseData, getEvents } from '../state'
import { getOptions } from '../state/selectors'
import { memo } from 'react'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
  },
  eventContainer: {
    margin: 0,
    flexGrow: 0,
    maxWidth: '100%',
    flexBasis: '100%',

    [theme.breakpoints.only('sm')]: {
      maxWidth: '50%',
      flexBasis: '50%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '33.333333%',
      flexBasis: '33.333333%',
    },
  },
  quarterContainer: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '25%',
      flexBasis: '25%',
    },
  },
}))

export interface Props {
  course: CourseData,
  events: AdditionalEvent[],
  onToggleEvent: (event: AdditionalEvent) => void,
}

const AdditionalEventsComponent = ({
  course,
  events,
  onToggleEvent,
}: Props) => {
  const { classes } = useStyles()
  const { darkMode } = useSelector(getOptions)

  const baseEventList = getEvents(course)
  const baseEventIds = baseEventList.map(e => e.id)
  const selectedEventIds = events.map(e => e.id).filter(e => baseEventIds.indexOf(e) > -1)
  const eventList = (
    selectedEventIds.length > 0
      ? baseEventList
      : baseEventList.filter(e => !e.hideIfOnlyEvent)
  )

  const eventContainerClasses = [classes.eventContainer]
  if (eventList.length === 4) {
    eventContainerClasses.push(classes.quarterContainer)
  }

  return (
    <div className={classes.root}>
      {eventList.map(event => (
        <div
          className={eventContainerClasses.join(' ')}
          key={event.id}
        >
          <FormControlLabel
            control={(
              <Checkbox
                checked={selectedEventIds.includes(event.id)}
                onChange={() => onToggleEvent(event)}
                color={darkMode ? 'primary' : 'secondary'}
                value={event.id}
                inputProps={{ 'data-cy': `event-${event.id}` } as any}
              />
            )}
            sx={{
              mt: -0.75,
              color: 'text.secondary',
            }}
            label={event.name}
          />
        </div>
      ))}
    </div>
  )
}
export const AdditionalEvents = memo(AdditionalEventsComponent)

export default AdditionalEvents
