import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { Notice } from '../state/Notice';

export interface Props {
  notice: Notice | null,
  onSnackbarClose: () => void,
}

export const NoticeDisplay = ({
  notice,
  onSnackbarClose,
}: Props) => {
  const { message = '', actions = null } = notice || {};
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
      autoHideDuration={6000}
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
