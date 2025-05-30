export const PartnerStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export type PartnerStatusType = (typeof PartnerStatus)[keyof typeof PartnerStatus]
