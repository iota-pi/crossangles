import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import { getCellHeight } from './timetableUtil';

const useStyles = makeStyles(_ => ({
  backgroundStripes: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
}));

export interface Props {
  opacity?: number,
}

const Stripes: React.FC<Props> = ({ opacity = 0.03 }: Props) => {
  const classes = useStyles();
  const compact = useSelector((state: RootState) => state.options.compactView || false);

  const backgroundStripesStyle = React.useMemo(
    () => {
      const stepSize = (getCellHeight(compact) * Math.SQRT2) / 4;
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
};
const BackgroundStripes = React.memo(Stripes);

export default BackgroundStripes;
