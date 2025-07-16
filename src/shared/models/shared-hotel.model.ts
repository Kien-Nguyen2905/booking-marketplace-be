import { HotelStatus, HotelType } from './../constants/hotel.constant'
import { z } from 'zod'

export const HotelSchema = z.object({
  id: z.number().int().positive(),
  partnerId: z.number().int().positive(),
  name: z.string().max(255).nonempty(),
  hotelPhoneNumber: z.string().max(20).nonempty(),
  type: z
    .enum([
      HotelType.HOTEL,
      HotelType.HOSTEL,
      HotelType.APARTMENT,
      HotelType.GUESTHOUSE,
      HotelType.HOME_STAY,
      HotelType.VILLA,
      HotelType.RESORT,
    ])
    .default(HotelType.HOTEL),
  reputationScore: z.number().int().default(100),
  rating: z.number().default(0),
  vat: z.number().min(0).max(100).int(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  address: z.string().nonempty(),
  provinceCode: z.number().int(),
  districtCode: z.number().int(),
  wardCode: z.number().int(),
  description: z.string().nonempty(),
  images: z.array(z.string()).min(3),
  status: z.enum([HotelStatus.PENDING, HotelStatus.ACTIVE, HotelStatus.INACTIVE]).default(HotelStatus.PENDING),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

export const HotelAmenitySchema = z.object({
  id: z.number(),
  hotelId: z.number(),
  amenityId: z.number(),
})

export type HotelAmenityType = z.infer<typeof HotelAmenitySchema>

export type HotelType = z.infer<typeof HotelSchema>
