export const ROOM_BED_TYPE = {
  KING: 'KING',
  QUEEN: 'QUEEN',
  DOUBLE: 'DOUBLE',
  TWIN: 'TWIN',
  SINGLE: 'SINGLE',
  BUNK: 'BUNK',
} as const
export type RoomBedType = (typeof ROOM_BED_TYPE)[keyof typeof ROOM_BED_TYPE]

export const POLICY_TYPE = {
  NON_REFUNDABLE: 'NON_REFUNDABLE',
  FREE_CANCELLATION: 'FREE_CANCELLATION',
  PAY_AT_HOTEL: 'PAY_AT_HOTEL',
} as const
export type PolicyType = (typeof POLICY_TYPE)[keyof typeof POLICY_TYPE]
