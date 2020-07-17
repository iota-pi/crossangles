import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { RootState } from '../../state';
import { useSelector } from 'react-redux';
import { getCellHeight } from './timetableUtil';

const useStyles = makeStyles(theme => ({
  backgroundStripes: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
}));


const BackgroundStripes: React.FC<{opacity?: number}> = React.memo(({ opacity = 0.03 }) => {
  const classes = useStyles();
  const compact = useSelector((state: RootState) => state.compactView);

  const backgroundStripesStyle = React.useMemo(
    () => {
      const stepSize = getCellHeight(compact) * Math.SQRT2 / 4;
      return {
        background: `repeating-linear-gradient(
          45deg,
          rgba(0, 0, 0, ${opacity}),
          rgba(0, 0, 0, ${opacity}) ${stepSize / 2}px,
          rgba(0, 0, 0, ${opacity * 1.5 + 0.05}) ${stepSize / 2}px,
          rgba(0, 0, 0, ${opacity * 1.5 + 0.05}) ${stepSize}px
        )`,
      };
    },
    [compact, opacity],
  );

  return (
    <div
      className={classes.backgroundStripes}
      style={backgroundStripesStyle}
    />
  );
});

export default BackgroundStripes;
