import { FC, memo, useMemo } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { DROPZONE_Z } from './timetableUtil'
import { Placement } from './timetableTypes'
import { LinkedSession, Options } from '../../state'
import SessionDetails from './SessionDetails'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: DROPZONE_Z,
  },
  background: {
    transition: theme.transitions.create(
      'background-color',
      {
        duration: theme.transitions.duration.shortest,
      },
    ),
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    borderWidth: 3,
    borderStyle: 'solid',
  },
  detailContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    boxShadow: theme.shadows[3],
  },
}))

export interface Props {
  colour?: string,
  highlighted: boolean,
  options: Options,
  position: Placement,
  session: LinkedSession,
}

const Dropzone: FC<Props> = ({
  colour,
  highlighted,
  options,
  position,
  session,
}: Props) => {
  const classes = useStyles()
  const styles = useMemo(
    () => {
      const { width, height, x, y, z } = position

      return {
        left: x,
        top: y,
        zIndex: z,
        width,
        height,
      }
    },
    [position],
  )
  const alpha = highlighted ? 'DD' : 'A0'
  const backgroundColor = colour ? `${colour}${alpha}` : 'none'
  const borderColor = colour || 'none'
  const dropzoneOptions: Options = {
    ...options,
    showEnrolments: true,
    showMode: true,
    showLocations: false,
    showWeeks: false,
  }

  return (
    <div
      className={classes.root}
      style={styles}
    >
      <div
        className={classes.background}
        style={{ backgroundColor, borderColor }}
      />
      <div className={classes.detailContainer}>
        <SessionDetails
          session={session}
          options={dropzoneOptions}
          disableTransitions
          hideTitle
          largerDetails
        />
      </div>
    </div>
  )
}

const TimetableDropzone: FC<Props> = memo(Dropzone)
export default TimetableDropzone
