import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { DEFAULT_NOTICE_TIMEOUT, Notice } from '../state';

export interface Props {
  notice: Notice | null,
  onSnackbarClose: () => void,
}

export const NoticeDisplay = ({
  notice,
  onSnackbarClose,
}: Props) => {
  const { message = '', actions = null, timeout = DEFAULT_NOTICE_TIMEOUT } = notice || {};
  const paragraphs = React.useMemo(
    () => message.split(/\n/g).map(p => ({ text: p, key: Math.random().toString() })),
    [message],
  );
  const handleClose = React.useCallback(
    () => {
      if (notice && notice.callback) {
        notice.callback();
      }
      onSnackbarClose();
    },
    [notice, onSnackbarClose],
  );

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
  );
};

export default NoticeDisplay;
