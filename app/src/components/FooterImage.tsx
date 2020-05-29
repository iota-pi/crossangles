import React from 'react';
import getCampus from '../getCampus';
import { WithStyles, createStyles, Theme, withStyles } from '@material-ui/core/styles';


const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(12),
  },
  image: {
    width: 150,
    height: 150,
  },
});

export interface Props extends WithStyles<typeof styles> {}


export const FooterImage = withStyles(styles)(({ classes }: Props) => {
  const campus = getCampus();
  const images: { [campus: string]: string } = {
    unsw: 'img/cbs.png',
  };
  const src = images[campus];

  return (
    <div className={classes.root}>
      <img src={src} alt="" className={classes.image} />
    </div>
  );
});
