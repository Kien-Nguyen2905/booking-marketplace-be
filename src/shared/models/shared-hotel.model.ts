import { HotelStatus, HotelType } from './../constants/hotel.constant'
import { z } from 'zod'

export const HotelSchema = z.object({
  id: z.number(),
  partnerId: z.number(),
  name: z.string().max(255),
  hotelPhoneNumber: z.string().max(20),
  type: z.enum([
    HotelType.HOTEL,
    HotelType.HOSTEL,
    HotelType.APARTMENT,
    HotelType.GUESTHOUSE,
    HotelType.HOMESTAY,
    HotelType.VILLA,
    HotelType.RESORT,
  ]),
  reputationScore: z.number().default(100),
  rating: z.number().default(0),
  vat: z.number().min(0).max(100),
  address: z.string(),
  provinceCode: z.number(),
  districtCode: z.number(),
  wardCode: z.number(),
  description: z.string(),
  images: z.array(z.string()).min(3),
  status: z.enum([HotelStatus.PENDING, HotelStatus.ACTIVE, HotelStatus.INACTIVE]).default(HotelStatus.PENDING),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export type HotelType = z.infer<typeof HotelSchema>
