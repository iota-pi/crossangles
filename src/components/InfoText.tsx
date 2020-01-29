import React, { ReactNode } from 'react';
import { Meta } from '../state/Meta'
import Typography, { TypographyProps } from '@material-ui/core/Typography';

export interface Props {
  meta: Meta,
  link?: boolean,
  typographyProps?: TypographyProps,
}

const InfoText = ({
  meta,
  typographyProps,
  link = true,
}: Props) => {
  const textParts = meta.promoText.split('{link}');
  const items: ReactNode[] = [textParts.shift() || ''];
  for (let [i, textPart] of textParts.entries()) {
    const linkEl = link ? (
      <a href={meta.linkURL} key={`linkPart-${i}`}>{meta.linkText}</a>
    ) : (
      <React.Fragment key={`linkPart-${i}`}>meta.linkText</React.Fragment>
    );
    const textEl = <React.Fragment key={`textPart-${i}`}>{textPart}</React.Fragment>;
    items.push(linkEl, textEl);
  }

  return (
    <Typography {...typographyProps}>
      {items}
    </Typography>
  )
}

export default InfoText;
