import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { Notice } from '../state';

export interface Props {
  notice: Notice | null,
  onSnackbarClose: () => void,
}

export const NoticeDisplay = ({
  notice,
  onSnackbarClose,
}: Props) => {
  const { message = '', actions = null, timeout = 6000 } = notice || {};
  const paragraphs = message.split(/\n/g);
  return (
    <Snackbar
      key={message || 'snackbar'}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={notice !== null}
      onClose={onSnackbarClose}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      autoHideDuration={timeout}
      message={(
        <div id="message-id">
          {paragraphs.map((text, i) => (
            <p key={`message-p${i}`}>{text}</p>
          ))}
        </div>
      )}
      action={actions}
    />
  )
}

export default NoticeDisplay;
