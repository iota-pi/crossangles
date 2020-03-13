import React, { ReactNode } from 'react';
import { Meta } from '../state/Meta'
import Typography, { TypographyProps } from '@material-ui/core/Typography';

export interface Props {
  meta: Meta,
  link?: boolean,
  disclaimer?: boolean,
  typographyProps?: TypographyProps,
  className?: string,
  onShowContact: () => void,
}

const InfoText = ({
  meta,
  typographyProps,
  link = true,
  disclaimer = false,
  className,
  onShowContact,
}: Props) => {
  const textParts = meta.promoText.split('{link}');
  const items: ReactNode[] = [textParts.shift() || ''];
  for (let [i, textPart] of textParts.entries()) {
    const linkEl = link ? (
      <a href={meta.ministryWebsite} key={`linkPart-${i}`}>{meta.ministryName}</a>
    ) : (
      <React.Fragment key={`linkPart-${i}`}>meta.linkText</React.Fragment>
    );
    const textEl = <React.Fragment key={`textPart-${i}`}>{textPart}</React.Fragment>;
    items.push(linkEl, textEl);
  }

  return (
    <div className={className}>
      <Typography {...typographyProps} paragraph>
        {items}
      </Typography>
      {disclaimer && (
        <Typography {...typographyProps} paragraph>
          The data was last updated at
          <span style={{ fontWeight: 400 }}> {meta.updateTime} ({meta.updateDate}) </span>
          from <a href={meta.source} target="_blank">{meta.source}</a>.
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
