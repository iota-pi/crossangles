import React, { ReactNode } from 'react';
import ReactGA from 'react-ga';
import { Meta } from '../state/Meta'
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import { CourseData } from '../state/Course';
import { CATEGORY } from '../analytics';

export interface Props {
  additional: CourseData[],
  meta: Meta,
  link?: boolean,
  disclaimer?: boolean,
  typographyProps?: TypographyProps,
  className?: string,
  onShowContact: () => void,
}

const InfoText = ({
  additional,
  meta,
  typographyProps,
  link = true,
  disclaimer = false,
  className,
  onShowContact,
}: Props) => {
  // Assumption: only one additional course will be auto-selected and has metadata
  const ministry = additional.filter(c => c.autoSelect && c.metadata)[0];

  let ministryPromo: ReactNode = null;
  if (ministry) {
    const ministryMeta = ministry.metadata!;

    const textParts = ministryMeta.promoText.split('{link}');
    const items: ReactNode[] = [textParts.shift() || ''];
    for (let [i, textPart] of textParts.entries()) {
      const linkEl = link ? (
        <a href={ministryMeta.website} key={`linkPart-${i}`}>{ministry.name}</a>
      ) : (
        <React.Fragment key={`linkPart-${i}`}>{ministry.name}</React.Fragment>
      );
      const textEl = <React.Fragment key={`textPart-${i}`}>{textPart}</React.Fragment>;
      items.push(linkEl, textEl);
    }

    ministryPromo = (
      <Typography {...typographyProps} paragraph>
        {items}
      </Typography>
    );
  }

  const handleLinkClick = (destination?: string) => {
    ReactGA.event({
      category: CATEGORY,
      action: 'ClassUtil Link',
      label: destination,
    });
  }


  return (
    <div className={className}>
      {ministryPromo}

      {disclaimer && (
        <Typography {...typographyProps} paragraph>
          The data was last updated
          at <span style={{ fontWeight: 400 }}>
            {meta.updateTime} ({meta.updateDate})
          </span> from <a
            href={meta.source}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(meta.source)}
          >
            {meta.source}
          </a>.
          CrossAngles comes without any guarantee of data accuracy or of optimality.
          If you have any questions or suggestions,
          please <span
            style={{
              color: 'rgb(0, 0, 238)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={(event) => { event.preventDefault(); onShowContact() }}
          >
            contact us
          </span>.
        </Typography>
      )}
    </div>
  )
}

export default InfoText;
