import React, { ReactNode } from 'react';
import { TransitionGroup } from 'react-transition-group';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Fade from '@material-ui/core/Fade';
import Collapse from '@material-ui/core/Collapse';
import { Options, LinkedSession, getDuration, DeliveryType, getComponentName, getOption } from '../../state';
import DeliveryModeIcon from './DeliveryModeIcon';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    textAlign: 'center',
    fontWeight: 300,
    lineHeight: 1.25,
    paddingLeft: 2,
    paddingRight: 2,

    '& > $label': {
      fontSize: '105%',

      '& > $em': {
        fontWeight: 400,
      },

      '& > $largerFont': {
        fontSize: '115%',
      },
    },
  },
  label: {},
  em: {},
  largerFont: {},
  details: {
    fontSize: '88%',

    '&$compact': {
      fontSize: '82%',
      lineHeight: 1.15,
    },

    '&$largerDetails': {
      fontSize: '100%',
    },
  },
  compact: {},
  largerDetails: {},
}));

export interface Props {
  session: LinkedSession,
  options: Options,
  disableTransitions?: boolean,
  hideTitle?: boolean,
  hideDetails?: boolean,
  largerDetails?: boolean,
}

type Detail = { key: string, text: ReactNode };


const SessionDetailsBase: React.FC<Props> = ({
  session,
  options,
  disableTransitions,
  hideTitle,
  hideDetails,
  largerDetails,
}: Props) => {
  const classes = useStyles();
  const { course, stream } = session;
  const compactView = getOption(options, 'compactView');
  const showMode = getOption(options, 'showMode');
  const isSpecialCourse = course.isAdditional || course.isCustom || false;
  const sessionTitle = isSpecialCourse ? stream.component : course.code;


  const details: Detail[] = React.useMemo(
    () => {
      const detailList: Detail[] = [];
      const showLocations = options.showLocations;
      const showEnrolments = options.showEnrolments;
      const showWeeks = options.showWeeks;

      if (showLocations && stream.delivery !== DeliveryType.online) {
        const location = session.location;
        if (location && location.toLowerCase() !== 'online') {
          detailList.push({ key: 'location', text: location });
        }
      }

      if (showEnrolments && stream.enrols) {
        const enrols = stream.enrols;
        if (enrols[1] > 0) {
          const enrolsText = enrols.join(' / ');
          detailList.push({ key: 'enrols', text: enrolsText });
        }
      }

      if (showWeeks) {
        const weeks = session.weeks;
        if (weeks) {
          const weeksText = `Weeks: ${weeks.replace(/-/g, '–').replace(/,\s*/g, ', ')}`;
          detailList.push({ key: 'weeks', text: weeksText });
        }
      }

      // Compress details onto two lines if duration is less than an hour
      if (getDuration(session) <= 1 && detailList.length >= 3) {
        const enrolsIndex = detailList.findIndex(d => d.key === 'enrols');
        const enrols = detailList.splice(enrolsIndex, 1)[0].text;
        detailList[1].text += ` (${enrols})`;
      }

      return detailList;
    },
    [options, session, stream],
  );

  const useComponentCode = compactView || (details.length > 1);
  let sessionComponent = useComponentCode ? stream.component : getComponentName(stream);
  if (isSpecialCourse) { sessionComponent = ''; }

  const titleClasses = [classes.em];
  if (!useComponentCode) {
    titleClasses.push(classes.largerFont);
  }

  const detailsClassList = [classes.details];
  if (largerDetails) {
    detailsClassList.push(classes.largerDetails);
  } else if (compactView && !showMode) {
    detailsClassList.push(classes.compact);
  }
  const detailsClasses = detailsClassList.join(' ');

  return (
    <div className={classes.root}>
      {!hideTitle && (
        <div className={classes.label}>
          <span className={titleClasses.join(' ')}>{sessionTitle}</span>
          {useComponentCode ? ' ' : <br />}
          <span>{sessionComponent}</span>
        </div>
      )}

      <Fade in={!hideDetails}>
        <div>
          <TransitionGroup>
            {details.map(detail => (
              <Collapse
                key={detail.key}
                enter={!disableTransitions}
                exit={!disableTransitions}
              >
                <div className={detailsClasses}>
                  {detail.text}
                </div>
              </Collapse>
            ))}
            {showMode && stream.delivery !== undefined && (
              <Collapse
                key="deliveryMode"
                enter={!disableTransitions}
                exit={!disableTransitions}
              >
                <DeliveryModeIcon delivery={stream.delivery} padded={getDuration(session) > 1} />
              </Collapse>
            )}
          </TransitionGroup>
        </div>
      </Fade>
    </div>
  );
};

const SessionDetails = React.memo(SessionDetailsBase);
export default SessionDetails;
