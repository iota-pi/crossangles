import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { StreamData } from '../state'
import { getOptions } from '../state/selectors'


const useStyles = makeStyles()(theme => ({
  lessSpaceAbove: {
    marginTop: -theme.spacing(1),
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
}))

export interface Props {
  checked: boolean,
  stream: StreamData,
  onChange: () => void,
}

function WebStream({ checked, stream, onChange }: Props) {
  const { classes } = useStyles()
  const { darkMode, includeFull } = useSelector(getOptions)

  const disabled = stream.full && !includeFull
  const descriptor = 'watch-later'
  let label = `Choose ${descriptor} lecture stream`
  if (stream.full) {
    label += ' (full)'
  }

  return (
    <FormControlLabel
      label={label}
      className={`${classes.secondaryText} ${classes.lessSpaceAbove}`}
      control={(
        <Checkbox
          checked={checked && !disabled}
          onChange={onChange}
          color={darkMode ? 'primary' : 'secondary'}
          disabled={disabled}
          value
        />
      )}
    />
  )
}

export default WebStream
