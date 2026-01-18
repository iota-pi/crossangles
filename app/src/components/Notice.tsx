import { useCallback, useMemo } from 'react'
import Snackbar from '@mui/material/Snackbar'
import { DEFAULT_NOTICE_TIMEOUT, Notice } from '../state'

export interface Props {
  notice: Notice | null,
  onSnackbarClose: () => void,
}

export const NoticeDisplay = ({
  notice,
  onSnackbarClose,
}: Props) => {
  const { message = '', actions = null, timeout = DEFAULT_NOTICE_TIMEOUT } = notice || {}
  const paragraphs = useMemo(
    () => message.split(/\n/g).map((p, i) => ({ text: p, key: i.toString() })),
    [message],
  )
  const handleClose = useCallback(
    () => {
      if (notice && notice.callback) {
        notice.callback()
      }
      onSnackbarClose()
    },
    [notice, onSnackbarClose],
  )

  return (
    <Snackbar
      key={message || 'snackbar'}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={notice !== null}
      onClose={handleClose}
      ContentProps={{ 'aria-describedby': 'message-id' }}
      autoHideDuration={timeout}
      message={(
        <div id="message-id">
          {paragraphs.map(p => (
            <p key={`message-p${p.key}`}>{p.text}</p>
          ))}
        </div>
      )}
      action={actions}
    />
  )
}

export default NoticeDisplay
