export const NOTIFY_TYPE = {
  REFUND: 'REFUND',
  DEMAND: 'DEMAND',
  INFORM: 'INFORM',
} as const

export type NotifyType = (typeof NOTIFY_TYPE)[keyof typeof NOTIFY_TYPE]
