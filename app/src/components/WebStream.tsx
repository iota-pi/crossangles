import { useSelector } from 'react-redux'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { StreamData } from '../state'
import { getOptions } from '../state/selectors'


export interface Props {
  checked: boolean,
  stream: StreamData,
  onChange: () => void,
}

function WebStream({ checked, stream, onChange }: Props) {
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
      sx={{
        mt: -1,
        color: 'text.secondary',
      }}
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
