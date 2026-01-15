import { useState, ChangeEvent } from 'react'
import { makeStyles } from 'tss-react/mui'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

const useStyles = makeStyles()(theme => ({
  dialog: {},
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  flexGrow: {
    flexGrow: 1,
  },
  moveRight: {
    marginRight: theme.spacing(-1),
  },
  marginTop: {
    marginTop: theme.spacing(2.5),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  clearButton: {
    marginRight: theme.spacing(3),
    cursor: 'pointer',
  },
}))

export interface Props {
  open: boolean,
  onSend: (name: string, email: string, message: string) => void,
  onClose: () => void,
}

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
function isValidEmail(email: string) {
  return emailRegex.test(email)
}

const ContactUs = ({
  open,
  onSend,
  onClose,
}: Props) => {
  const { classes } = useStyles()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [showEmailError, setShowEmailError] = useState(false)
  const [message, setMessage] = useState('')

  const handleClickSave = () => {
    onSend(name, email, message)
    onClose()
  }

  const handleClose = (_event: unknown, reason: string) => {
    if (reason === 'backdropClick') {
      const partiallyCompleted = name || email || message
      if (partiallyCompleted) {
        return
      }
    }
    onClose()
  }

  const handleExited = () => {
    setName('')
    setEmail('')
    setShowEmailError(false)
    setMessage('')
  }

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value
    setEmail(newEmail)
    setShowEmailError(prev => prev && !isValidEmail(newEmail))
  }

  const handleBlurEmail = () => {
    setShowEmailError(!isValidEmail(email) && email.length > 0)
  }

  const handleChangeMessage = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }

  const canSubmit = (): boolean => {
    const nameError = !name
    const emailError = !email || !isValidEmail(email)
    const messageError = !message

    return !nameError && !emailError && !messageError
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onExited: handleExited,
      }}
      aria-labelledby="contact-us-title"
      className={classes.dialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6" id="contact-us-title" className={classes.flexGrow}>
          Get in Contact
        </Typography>

        <IconButton
          aria-label="close"
          onClick={onClose}
          className={classes.moveRight}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Name"
          placeholder="Joe Bloggs"
          value={name}
          onChange={handleChangeName}
          inputProps={{ maxLength: 40 }}
          helperText={`${name.length} / 40`}
          autoFocus
          className={classes.paddingBottom}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          placeholder="joe.bloggs@example.com"
          value={email}
          onChange={handleChangeEmail}
          onBlur={handleBlurEmail}
          helperText={
            !showEmailError
              ? 'We only use your email address to reply to you'
              : 'Please enter a valid email address'
          }
          error={showEmailError}
          className={classes.paddingBottom}
          fullWidth
        />

        <TextField
          label="Message"
          value={message}
          onChange={handleChangeMessage}
          className={classes.paddingBottom}
          fullWidth
          multiline
          rows={5}
        />
      </DialogContent>

      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          disabled={!canSubmit()}
          onClick={handleClickSave}
        >
          Send Message
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContactUs
