export const HotelStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

export type HotelStatusType = (typeof HotelStatus)[keyof typeof HotelStatus]

export const HotelType = {
  HOTEL: 'HOTEL',
  HOSTEL: 'HOSTEL',
  APARTMENT: 'APARTMENT',
  GUESTHOUSE: 'GUESTHOUSE',
  HOME_STAY: 'HOME_STAY',
  VILLA: 'VILLA',
  RESORT: 'RESORT',
} as const

export type HotelTypeType = (typeof HotelType)[keyof typeof HotelType]
