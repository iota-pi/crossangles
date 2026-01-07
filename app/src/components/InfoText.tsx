import React, { ReactNode } from 'react'
import { event } from 'react-ga'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Typography, { TypographyProps } from '@material-ui/core/Typography'
import { CourseData, Meta } from '../state'
import { CATEGORY } from '../analytics'

export interface Props {
  additional: CourseData[],
  meta: Meta,
  link?: boolean,
  disclaimer?: boolean,
  typographyProps?: TypographyProps,
  className?: string,
  onShowContact: () => void,
}

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}))

const InfoText = ({
  additional,
  meta,
  typographyProps,
  link = true,
  disclaimer = false,
  className,
  onShowContact,
}: Props) => {
  const classes = useStyles()

  // Assumption: only one additional course will be auto-selected and has metadata
  const ministry = additional.filter(c => c.autoSelect && c.metadata)[0]

  const handleLinkClick = (action: string, destination?: string) => {
    event({
      category: CATEGORY,
      action,
      label: destination,
    })
  }

  let ministryPromo: ReactNode = null
  if (ministry) {
    const ministryMeta = ministry.metadata!

    const textParts = ministryMeta.promoText.split('{link}')
    const items: ReactNode[] = [textParts.shift() || '']
    for (const [i, textPart] of textParts.entries()) {
      const linkEl = link ? (
        <a
          key={`linkPart-${i}`}
          href={ministryMeta.website}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
          onClick={() => handleLinkClick('Ministry Link', ministryMeta.website)}
        >
          {ministry.name}
        </a>
      ) : (
        <React.Fragment key={`linkPart-${i}`}>{ministry.name}</React.Fragment>
      )
      const textEl = <React.Fragment key={`textPart-${i}`}>{textPart}</React.Fragment>
      items.push(linkEl, textEl)
    }

    ministryPromo = (
      <Typography {...typographyProps} paragraph>
        {items}
      </Typography>
    )
  }

  const sources = (
    <>
      {meta.sources.map((source, i) => (
        <React.Fragment key={source}>
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
            onClick={() => handleLinkClick('ClassUtil Link', source)}
          >
            {source.replace(/^https?:\/\/(?:www\.)?/, '')}
          </a>

          {i < meta.sources.length - 1 && ' and '}
        </React.Fragment>
      ))}
    </>
  )


  return (
    <div className={className}>
      {ministryPromo}

      {disclaimer && (
        <Typography {...typographyProps} paragraph>
          The data was last updated at
          {' '}
          <span style={{ fontWeight: 400 }}>
            {meta.updateTime} ({meta.updateDate})
          </span>
          {' '}
          from {sources} for
          {' '}
          <span style={{ fontWeight: 400 }}>
            Term {meta.term}, {meta.year}
          </span>
          .
          CrossAngles comes without any guarantee of data accuracy.
          If you have any questions or suggestions,
          please
          {' '}
          <a
            className={classes.link}
            onClick={e => { e.preventDefault(); onShowContact() }}
            href="#contact"
          >
            contact us
          </a>
          .
        </Typography>
      )}

      <Typography {...typographyProps} paragraph>
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
    </div>
  )
}

export default InfoText
