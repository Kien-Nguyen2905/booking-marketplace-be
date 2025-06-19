export const TRANSACTION_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
} as const

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]

export const PREFIX_CONTENT_ORDER = {
  PAY: 'BKP',
  REFUND: 'BKR',
}

export type PrefixContentOrder = (typeof PREFIX_CONTENT_ORDER)[keyof typeof PREFIX_CONTENT_ORDER]
