export const ROOM_BED_TYPE = {
  KING: 'KING',
  QUEEN: 'QUEEN',
  DOUBLE: 'DOUBLE',
  TWIN: 'TWIN',
  SINGLE: 'SINGLE',
  BUNK: 'BUNK',
} as const
export type RoomBedType = (typeof ROOM_BED_TYPE)[keyof typeof ROOM_BED_TYPE]
