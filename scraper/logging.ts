import {
  transports,
  format,
  createLogger,
  LoggerOptions,
} from 'winston'

export interface ExtraLogFields {
  campus?: string,
}

export const defaultTransports = [
  new transports.Console({
    silent: process.env.NODE_ENV === 'test',
  }),
]

export const defaultConfig: LoggerOptions = {
  level: 'info',
  format: format.json(),
  defaultMeta: { component: 'scraper' },
  transports: defaultTransports,
}

export function getLogger(section?: string, extra?: ExtraLogFields) {
  return createLogger({
    ...defaultConfig,
    defaultMeta: { ...defaultConfig.defaultMeta, ...extra, section },
  })
}
