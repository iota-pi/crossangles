import React, { ReactNode } from 'react';
import { Meta } from '../state/Meta'
import Typography, { TypographyProps } from '@material-ui/core/Typography';

export interface Props {
  meta: Meta,
  link?: boolean,
  disclaimer?: boolean,
  typographyProps?: TypographyProps,
  className?: string,
}

const InfoText = ({
  meta,
  typographyProps,
  link = true,
  disclaimer = false,
  className,
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
          from <a href={meta.source}>{meta.source}</a>.
          CrossAngles comes without any guarantee of data accuracy or of optimality.
          We also collect anonymous information about how people tend to use this tool to help us make improvements.
          {/* If you have any questions or suggestions, please contact us. */}
        </Typography>
      )}
    </div>
  )
}

export default InfoText;
