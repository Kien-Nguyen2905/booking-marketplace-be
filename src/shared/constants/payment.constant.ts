export const PAYMENT_TYPE = {
  BANKING: 'BANKING',
  PAY_AT_HOTEL: 'PAY_AT_HOTEL',
} as const

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE]
