import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import CloseIcon from '@material-ui/icons/Close';


const useStyles = makeStyles(theme => ({
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
}))


export function AboutCrossAngles ({ onShowContact }: { onShowContact: () => void }) {
  const [showDialog, setShowDialog] = React.useState(false);
  const classes = useStyles()

  const handleOpen = () => setShowDialog(true);
  const handleClose = () => setShowDialog(false);

  return (
    <div>
      <IconButton
        color="inherit"
        onClick={handleOpen}
      >
        <InfoIcon />
      </IconButton>

      <Dialog
        open={showDialog}
        onClose={handleClose}
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6" id="contact-us-title" className={classes.flexGrow}>
            About CrossAngles
          </Typography>

          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={classes.moveRight}
            data-cy="close-dialog"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography paragraph>
            CrossAngles is a timetable planning program.
            CrossAngles aims to provide a simple way for students to create their timetable for UNSW.
            However, it is not an official part of the UNSW enrolment system,
            and planning your timetable here does not mean that you have enrolled for the term yet.
          </Typography>

          <Typography paragraph>
            CrossAngles is provided by <a
              href="https://www.campusbiblestudy.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              Campus Bible Study
            </a> —
            a group of people at UNSW who are interested in learning together about Jesus from the Bible.
            Whether you follow Jesus, or want to find out what He's all about,
            Campus Bible Study is a great place for you to learn more.
            If you've never come before, we recommend checking out the Bible talks.
          </Typography>

          <Typography paragraph>
            If you have any questions or suggestions,
            please <span
              style={{
                color: 'rgb(0, 0, 238)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={(event) => { event.preventDefault(); onShowContact(); }}
            >
              contact us
            </span>.
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}