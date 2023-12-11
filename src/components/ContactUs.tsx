import React, { PureComponent, ChangeEvent } from 'react';

// Styles
import { Theme } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme) => createStyles({
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
});

export interface Props extends WithStyles<typeof styles> {
  open: boolean,
  onSend: (name: string, email: string, message: string) => void,
  onClose: () => void,
}

export interface State {
  name: string,
  email: string,
  showEmailError: boolean,
  message: string,
}


const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
function isValidEmail(email: string) {
  return emailRegex.test(email);
}


class CreateCustom extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      showEmailError: false,
      message: '',
    };
  }

  private handleClickSave = () => {
    this.props.onSend(
      this.state.name,
      this.state.email,
      this.state.message,
    );
    this.props.onClose();
  };

  private handleClose = (event: Event, reason: string) => {
    if (reason === "backdropClick") {
      const partiallyCompleted = (
        this.state.name || this.state.email || this.state.message
      );
      if (partiallyCompleted) {
        return;
      }
    }
    this.props.onClose();
  };

  private handleExited = () => {
    this.setState({
      name: '',
      email: '',
      showEmailError: false,
      message: '',
    });
  };

  private handleChangeName = (event: ChangeEvent<{value: unknown}>) => {
    this.setState({ name: event.target.value as string });
  };

  private handleChangeEmail = (event: ChangeEvent<{value: unknown}>) => {
    const email = event.target.value as string;
    this.setState(({ showEmailError }) => ({
      email,
      showEmailError: showEmailError && !isValidEmail(email),
    }));
  };

  private handleBlurEmail = () => {
    this.setState(({ email }) => (
      { showEmailError: !isValidEmail(email) && email.length > 0 }
    ));
  };

  private handleChangeMessage = (event: ChangeEvent<{value: unknown}>) => {
    this.setState({ message: event.target.value as string });
  };

  private canSubmit = (): boolean => {
    const nameError = !this.state.name;
    const emailError = !this.state.email || !isValidEmail(this.state.email);
    const messageError = !this.state.message;

    return !nameError && !emailError && !messageError;
  };

  render() {
    const classes = this.props.classes;

    return (
      <Dialog
        open={this.props.open}
        onClose={this.handleClose}
        TransitionProps={{
          onExited: this.handleExited,
        }}
        aria-labelledby="contact-us-title"
        className={classes.dialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6" id="contact-us-title" className={classes.flexGrow}>
            Get in Contact
          </Typography>

          <IconButton
            aria-label="close"
            onClick={this.props.onClose}
            className={classes.moveRight}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Name"
            placeholder="Joe Bloggs"
            value={this.state.name}
            onChange={this.handleChangeName}
            inputProps={{ maxLength: 40 }}
            helperText={`${this.state.name.length} / 40`}
            autoFocus
            className={classes.paddingBottom}
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            placeholder="joe.bloggs@example.com"
            value={this.state.email}
            onChange={this.handleChangeEmail}
            onBlur={this.handleBlurEmail}
            helperText={
              !this.state.showEmailError
                ? 'We only use your email address to reply to you'
                : 'Please enter a valid email address'
            }
            error={this.state.showEmailError}
            className={classes.paddingBottom}
            fullWidth
          />

          <TextField
            label="Message"
            value={this.state.message}
            onChange={this.handleChangeMessage}
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
            disabled={!this.canSubmit()}
            onClick={this.handleClickSave}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(CreateCustom);
