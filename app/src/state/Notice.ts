import type { ReactNode } from 'react'

export const DEFAULT_NOTICE_TIMEOUT = 6000

export type Notice = {
  message: string,
  actions: ReactNode,
  timeout: number | null,
  callback?: () => void,
}
