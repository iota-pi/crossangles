import { makeStyles } from 'tss-react/mui'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { modalview } from 'react-ga'
import { useCallback, useState } from 'react'


const useStyles = makeStyles()(theme => ({
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
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))


const AboutCrossAngles = ({ onShowContact }: { onShowContact: () => void }) => {
  const { classes } = useStyles()
  const [showDialog, setShowDialog] = useState(false)

  const handleOpen = useCallback(
    () => {
      setShowDialog(true)
      modalview('about-crossangles')
    },
    [],
  )
  const handleClose = useCallback(
    () => setShowDialog(false),
    [],
  )

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
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6" className={classes.flexGrow}>
            About CrossAngles
          </Typography>

          <IconButton
            aria-label="close"
            onClick={handleClose}
            className={classes.moveRight}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography paragraph>
            CrossAngles is a timetable planning program, which aims to provide
            a simple way for students to create their timetable for UNSW.
            However, it is not an official part of the UNSW enrolment system,
            and planning your timetable here does not mean
            that you have registered or enrolled for the term yet.
          </Typography>

          <Typography paragraph>
            CrossAngles is provided by
            {' '}
            <a
              className={classes.link}
              href="https://www.campusbiblestudy.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              Campus Bible Study
            </a>
            {' '}
            — a group of people at UNSW who are interested in
            learning together about Jesus from the Bible.
            Whether you follow Jesus, or want to find out what He&apos;s all about,
            Campus Bible Study is a great place for you to learn more.
            If you&apos;ve never come before, we recommend checking out the Bible talks.
          </Typography>

          <Typography paragraph>
            If you have any questions or suggestions,
            please
            {' '}
            <a
              className={classes.link}
              onClick={event => { event.preventDefault(); onShowContact() }}
              href="#contact"
            >
              contact us
            </a>
            .
          </Typography>

          <Typography paragraph>
            If you would like to contribute or view the source code, you can find
            {' '}
            <a
              className={classes.link}
              href="https://github.com/iota-pi/crossangles"
              rel="noopener noreferrer"
              target="_blank"
            >
              CrossAngles on GitHub
            </a>
            .
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AboutCrossAngles
